import { create } from 'zustand'

const USERS_KEY = 'clay-users'
const CURRENT_KEY = 'clay-current-user-email'
const API_ACCESS_TOKEN_KEY = 'clay-api-access-token'
const API_REFRESH_TOKEN_KEY = 'clay-api-refresh-token'

export interface StoredUser {
  firstName: string
  lastName: string
  email: string
  /** Plain-text — mock only. NEVER use this pattern with a real backend. */
  password: string
}

export interface SubscriptionSummary {
  forfaitId: string
  forfaitNom: string
  prixAn: number | null
  prixMois: number | null
  startDate: string
  zones: number
}

export interface UserAccount {
  firstName: string
  lastName: string
  email: string
  subscription: SubscriptionSummary | null
}

interface AuthState {
  user: UserAccount | null
  /** Lit la liste persistée. */
  register: (data: { firstName: string; lastName: string; email: string; password: string; language?: string }) => Promise<{ ok: true } | { ok: false; error: 'email_taken' | 'network' }>
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: 'no_account' | 'bad_password' | 'network' }>
  logout: () => void
  setSubscription: (sub: SubscriptionSummary) => void
}

type BackendTokens = {
  access_token: string
  refresh_token?: string
}

type BackendUser = {
  email: string
  firstName: string
  lastName: string
}

function readUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[] } catch { return [] }
}
function writeUsers(users: StoredUser[]): void {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)) } catch {}
}
function upsertStoredUser(user: StoredUser): void {
  const users = readUsers()
  const index = users.findIndex((item) => item.email.toLowerCase() === user.email.toLowerCase())
  if (index >= 0) users[index] = user
  else users.push(user)
  writeUsers(users)
}
function readCurrentEmail(): string | null {
  try { return localStorage.getItem(CURRENT_KEY) } catch { return null }
}
function writeCurrentEmail(email: string | null): void {
  try {
    if (email) localStorage.setItem(CURRENT_KEY, email)
    else localStorage.removeItem(CURRENT_KEY)
  } catch {}
}

const SUB_KEY_PREFIX = 'clay-sub-' // per-email subscription
const PENDING_SUB_KEY = 'clay-pending-subscription'

function readSubscriptionForEmail(email: string): SubscriptionSummary | null {
  try { const raw = localStorage.getItem(SUB_KEY_PREFIX + email); return raw ? JSON.parse(raw) as SubscriptionSummary : null } catch { return null }
}
function writeSubscriptionForEmail(email: string, sub: SubscriptionSummary): void {
  try { localStorage.setItem(SUB_KEY_PREFIX + email, JSON.stringify(sub)) } catch {}
}

function readPendingSubscription(): SubscriptionSummary | null {
  try { const raw = localStorage.getItem(PENDING_SUB_KEY); return raw ? JSON.parse(raw) as SubscriptionSummary : null } catch { return null }
}
function clearPendingSubscription(): void {
  try { localStorage.removeItem(PENDING_SUB_KEY) } catch {}
}

export function savePendingSubscription(sub: SubscriptionSummary): void {
  try { localStorage.setItem(PENDING_SUB_KEY, JSON.stringify(sub)) } catch {}
}

export function getCurrentStoredUser(): StoredUser | null {
  const email = readCurrentEmail()
  if (!email) return null
  return readUsers().find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function readApiAccessToken(): string | null {
  try { return localStorage.getItem(API_ACCESS_TOKEN_KEY) } catch { return null }
}

export function saveApiTokens(tokens: { access_token: string; refresh_token?: string }): void {
  try {
    localStorage.setItem(API_ACCESS_TOKEN_KEY, tokens.access_token)
    if (tokens.refresh_token) localStorage.setItem(API_REFRESH_TOKEN_KEY, tokens.refresh_token)
  } catch {}
}

export function clearApiTokens(): void {
  try {
    localStorage.removeItem(API_ACCESS_TOKEN_KEY)
    localStorage.removeItem(API_REFRESH_TOKEN_KEY)
  } catch {}
}

async function requestJson<T>(url: string, options: RequestInit): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  try {
    const response = await fetch(url, options)
    if (!response.ok) return { ok: false, status: response.status }
    return { ok: true, data: await response.json() as T }
  } catch {
    return { ok: false, status: 0 }
  }
}

async function fetchBackendUser(accessToken: string): Promise<BackendUser | null> {
  const response = await requestJson<BackendUser>('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return response.ok ? response.data : null
}

function hydrate(): UserAccount | null {
  const email = readCurrentEmail()
  if (!email) return null
  const users = readUsers()
  const u = users.find((x) => x.email === email)
  if (!u) return null
  return {
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    subscription: readSubscriptionForEmail(u.email),
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: hydrate(),

  register: async ({ firstName, lastName, email, password, language }) => {
    const users = readUsers()
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'email_taken' }
    }

    const backend = await requestJson<BackendTokens>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password, language }),
    })

    if (!backend.ok) {
      if (backend.status === 409) return { ok: false, error: 'email_taken' }
      if (backend.status !== 0) return { ok: false, error: 'network' }
    }

    if (backend.ok) saveApiTokens(backend.data)
    upsertStoredUser({ firstName, lastName, email, password })
    writeCurrentEmail(email)
    // Si une souscription est en attente, on l'attache au nouveau compte.
    const pending = readPendingSubscription()
    if (pending) {
      writeSubscriptionForEmail(email, pending)
      clearPendingSubscription()
    }
    set({ user: { firstName, lastName, email, subscription: pending } })
    return { ok: true }
  },

  login: async (email, password) => {
    const backend = await requestJson<BackendTokens>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (backend.ok) {
      saveApiTokens(backend.data)
      const backendUser = await fetchBackendUser(backend.data.access_token)
      const firstName = backendUser?.firstName ?? email.split('@')[0]
      const lastName = backendUser?.lastName ?? ''
      const storedEmail = backendUser?.email ?? email
      upsertStoredUser({ firstName, lastName, email: storedEmail, password })
      writeCurrentEmail(storedEmail)
      const pending = readPendingSubscription()
      if (pending) {
        writeSubscriptionForEmail(storedEmail, pending)
        clearPendingSubscription()
      }
      set({ user: { firstName, lastName, email: storedEmail, subscription: readSubscriptionForEmail(storedEmail) } })
      return { ok: true }
    }

    const users = readUsers()
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase())
    if (!u) return { ok: false, error: backend.status === 401 ? 'bad_password' : 'no_account' }
    if (u.password !== password) return { ok: false, error: 'bad_password' }
    clearApiTokens()
    writeCurrentEmail(u.email)
    const pending = readPendingSubscription()
    if (pending) {
      writeSubscriptionForEmail(u.email, pending)
      clearPendingSubscription()
    }
    set({ user: { firstName: u.firstName, lastName: u.lastName, email: u.email, subscription: readSubscriptionForEmail(u.email) } })
    return { ok: true }
  },

  logout: () => {
    writeCurrentEmail(null)
    clearApiTokens()
    set({ user: null })
  },

  setSubscription: (sub) => {
    const user = get().user
    if (!user) return
    writeSubscriptionForEmail(user.email, sub)
    set({ user: { ...user, subscription: sub } })
  },
}))
