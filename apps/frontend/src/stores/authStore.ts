import { create } from 'zustand'
import { api, clearTokens, getToken, setTokens } from '../services/api'

export const readApiAccessToken = getToken
export const clearApiTokens = clearTokens
export function saveApiTokens(tokens: { access_token: string; refresh_token?: string }): void {
  setTokens(tokens.access_token, tokens.refresh_token ?? '')
}

export interface UserAccount {
  id: string
  firstName: string
  lastName: string
  email: string
  profile: string | null
  role: string
  subscription?: SubscriptionSummary | null
}

export interface SubscriptionSummary {
  id: string
  offerId: string
  offerName: string | null
  monthlyPrice: number | null
  yearlyPrice: number | null
  status: 'draft' | 'pending_documents' | 'pending_payment' | 'active' | 'suspended' | 'cancelled' | 'expired'
  fraudScore: number | null
  fraudLevel: string | null
  startDate: string | null
  endDate: string | null
}

interface AuthState {
  user: UserAccount | null
  token: string | null
  hydrated: boolean
  hydrate: () => Promise<void>
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    language?: string
  }) => Promise<{ ok: true } | { ok: false; error: string }>
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  loginWithFranceConnect: () => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getToken(),
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    const token = getToken()
    if (!token) { set({ hydrated: true }); return }
    try {
      const { data } = await api.get<UserAccount>('/auth/me')
      set({ user: data, token, hydrated: true })
    } catch {
      clearTokens()
      set({ user: null, token: null, hydrated: true })
    }
  },

  register: async ({ firstName, lastName, email, password, language }) => {
    try {
      const { data } = await api.post<{ access_token: string; refresh_token: string }>('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        ...(language ? { language } : {}),
      })
      setTokens(data.access_token, data.refresh_token)
      const { data: me } = await api.get<UserAccount>('/auth/me')
      set({ user: me, token: data.access_token })
      return { ok: true }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur inconnue'
      return { ok: false, error: String(msg) }
    }
  },

  login: async (email, password) => {
    try {
      const { data } = await api.post<{ access_token: string; refresh_token: string }>('/auth/login', {
        email,
        password,
      })
      setTokens(data.access_token, data.refresh_token)
      const { data: me } = await api.get<UserAccount>('/auth/me')
      set({ user: me, token: data.access_token })
      return { ok: true }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Identifiants invalides'
      return { ok: false, error: String(msg) }
    }
  },

  loginWithFranceConnect: async () => {
    try {
      const { data } = await api.post<{ access_token: string; refresh_token: string }>('/auth/franceconnect/mock')
      setTokens(data.access_token, data.refresh_token)
      const { data: me } = await api.get<UserAccount>('/auth/me')
      set({ user: me, token: data.access_token })
      return { ok: true }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur FranceConnect'
      return { ok: false, error: String(msg) }
    }
  },

  logout: () => {
    clearTokens()
    set({ user: null, token: null })
  },
}))

export function getCurrentStoredUser(): (UserAccount & { password?: string }) | null {
  return useAuthStore.getState().user
}
