import { API_BASE_URL } from '../constants/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options ?? {}
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...optHeaders },
    ...restOptions,
  })
  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      message = body.message ?? message
    } catch {}
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

function auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export const authService = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: { id: string; email: string; firstName: string; lastName: string; profile?: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    request<{ accessToken: string; user: { id: string; email: string; firstName: string; lastName: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: (token: string) =>
    request<{ id: string; email: string; firstName: string; lastName: string; profile?: string }>('/auth/me', {
      headers: auth(token),
    }),
}

export const usersService = {
  getSubscription: (token: string) =>
    request<{ id: string; offerId: string; status: string; startDate?: string; endDate?: string } | null>('/users/me/subscription', {
      headers: auth(token),
    }),
  getNotifications: (token: string) =>
    request<{ id: string; type: string; message: string; readAt: string | null; createdAt: string }[]>('/users/me/notifications', {
      headers: auth(token),
    }),
  getGamification: (token: string) =>
    request<{ points: number; level: number; badges: string[]; nextLevelPoints: number }>('/users/me/gamification', {
      headers: auth(token),
    }),
  getInterests: (token: string) =>
    request<{ interests: string[] }>('/users/me/interests', {
      headers: auth(token),
    }),
  updateInterests: (token: string, interests: string[]) =>
    request<{ id: string; interests: string[] }>('/users/me/interests', {
      method: 'PATCH',
      body: JSON.stringify({ interests }),
      headers: auth(token),
    }),
  updateProfile: (token: string, profile: string) =>
    request<{ id: string }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ profile }),
      headers: auth(token),
    }),
}

export const feedService = {
  getFeed: (token: string) =>
    request<{ id: string; type: string; title: string; body: string; emoji: string; tag: string }[]>('/feed', {
      headers: auth(token),
    }),
}

export const tripsService = {
  getToday: (token: string) =>
    request<{ date: string; totalTrips: number; totalDuration: number; totalCo2Saved: number; trips: TripItem[] }>('/trips/today', {
      headers: auth(token),
    }),
  getWeek: (token: string) =>
    request<{ weekTrips: number; weekDuration: number; weekCo2Saved: number; weekKm: number; mostUsedLine: string | null; streak: number }>('/trips/week', {
      headers: auth(token),
    }),
  getStats: (token: string) =>
    request<{ totalTrips: number; totalCo2Saved: number; totalKm: number; weeksActive: number }>('/trips/stats', {
      headers: auth(token),
    }),
  getFavorites: (token: string) =>
    request<{ line: string; lineType: string; count: number }[]>('/trips/favorites', {
      headers: auth(token),
    }),
  getAlerts: (token: string) =>
    request<{ id: string; line: string; lineType: string; type: string; title: string; message: string; startDate: string; endDate: string | null }[]>('/trips/alerts', {
      headers: auth(token),
    }),
  getHistory: (token: string) =>
    request<TripItem[]>('/trips/history', { headers: auth(token) }),
  log: (token: string, trip: LogTripDto) =>
    request<TripItem>('/trips/log', {
      method: 'POST',
      body: JSON.stringify(trip),
      headers: auth(token),
    }),
}

export const leaderboardService = {
  get: (token: string) =>
    request<{ rank: number; firstName: string; lastName: string; points: number; level: number; badgeCount: number; isMe: boolean }[]>('/users/leaderboard', {
      headers: auth(token),
    }),
}

export interface BackendOffer {
  id: string
  name: string
  description: string | null
  yearlyPrice: number | null
  monthlyPrice: number | null
  renewal: string | null
  active: boolean
}

export interface DocumentVerifyResult {
  valid: boolean
  confidence: number
  documentType: string
  issues: string[]
}

async function multipart<T>(path: string, token: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
    body: form,
  })
  if (!res.ok) {
    let message = `API error ${res.status}`
    try { const b = await res.json(); message = b.message ?? message } catch {}
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export const documentsService = {
  upload: (token: string, subscriptionId: string, type: string, file: { uri: string; name: string; mimeType: string }) => {
    const form = new FormData()
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob)
    form.append('subscriptionId', subscriptionId)
    form.append('type', type)
    return multipart<{ id: string; status: string }>('/documents', token, form)
  },

  verify: (token: string, subscriptionId: string, file: { uri: string; name: string; mimeType: string }) => {
    const form = new FormData()
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob)
    form.append('subscriptionId', subscriptionId)
    return multipart<DocumentVerifyResult & { id: string }>('/documents/verify', token, form)
  },
}

export const offersService = {
  getAll: () =>
    request<BackendOffer[]>('/offers'),
  getByProfile: (profile: string) =>
    request<BackendOffer[]>(`/offers?profile=${encodeURIComponent(profile)}`),
}

export const subscriptionsService = {
  cancel: (token: string, id: string) =>
    request<void>(`/subscriptions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  create: (token: string, offerId: string) =>
    request<{ id: string }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ offerId }),
      headers: auth(token),
    }),
  confirm: (token: string, id: string) =>
    request<void>(`/subscriptions/${id}/confirm`, {
      method: 'POST',
      headers: auth(token),
    }),
}

export const chatService = {
  send: async (
    token: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    onChunk: (text: string) => void,
  ): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ messages }),
    })
    if (!res.ok) throw new Error(`Chat error ${res.status}`)
    const body = await res.text()
    for (const line of body.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') continue
      try { const { text } = JSON.parse(payload); if (text) onChunk(text) } catch {}
    }
  },
}

export interface StoredLeg {
  line: string; from: string; to: string; stops: number; intermediate: string[]
}
export interface StoredTransfer {
  fromStation: string; toStation: string; isWalk: boolean; label?: string
}
export interface StoredItinerary {
  legs: StoredLeg[]; transfers: StoredTransfer[]; duration: number
}

export interface TripItem {
  id: string
  line: string
  toLine: string | null
  lineType: 'metro' | 'rer' | 'bus' | 'tram' | 'transilien'
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  duration: number
  zones: number[]
  itineraryData: StoredItinerary | null
  co2Saved: number
  tripDate: string
}

export interface LogTripDto {
  line: string
  toLine?: string
  lineType: 'metro' | 'rer' | 'bus' | 'tram' | 'transilien'
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  duration: number
  zones: number[]
  itineraryData?: StoredItinerary
  co2Saved: number
}

const IDFM_API = 'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/referentiel-des-lignes'

export type LineMode = 'metro' | 'rer' | 'bus' | 'tram' | 'transilien'

export interface IdfmLine {
  shortname: string
  color: string
  textColor: string
  pictoUrl: string | null
}

const lineCache = new Map<string, IdfmLine | null>()

const modeMap: Record<LineMode, string> = {
  metro: 'metro',
  rer: 'rail',
  tram: 'tram',
  bus: 'bus',
  transilien: 'rail',
}

function recordToLine(record: Record<string, unknown>, mode: LineMode): IdfmLine {
  const picto = record.picto as Record<string, unknown> | null
  return {
    shortname: record.shortname_line as string,
    color: `#${record.colourweb_hexa}`,
    textColor: `#${record.textcolourweb_hexa}`,
    pictoUrl: picto?.url as string ?? null,
  }
}

let preloadPromise: Promise<void> | null = null

export const idfmService = {
  getLine: async (line: string, mode: LineMode): Promise<IdfmLine | null> => {
    const key = `${mode}:${line}`
    if (lineCache.has(key)) return lineCache.get(key)!
    try {
      const where = `shortname_line="${line}" and transportmode="${modeMap[mode]}"`
      const res = await fetch(`${IDFM_API}/records?where=${encodeURIComponent(where)}&limit=1`)
      if (!res.ok) { lineCache.set(key, null); return null }
      const data = await res.json()
      const record = data.results?.[0]
      if (!record) { lineCache.set(key, null); return null }
      const result = recordToLine(record, mode)
      lineCache.set(key, result)
      return result
    } catch {
      lineCache.set(key, null)
      return null
    }
  },

  preloadAll: (): Promise<void> => {
    if (preloadPromise) return preloadPromise
    const modes: [LineMode, string][] = [
      ['metro', 'metro'],
      ['rer', 'rail'],
      ['tram', 'tram'],
      ['transilien', 'rail'],
    ]
    preloadPromise = Promise.all(
      modes.map(async ([mode, transportmode]) => {
        try {
          const where = `transportmode="${transportmode}" and has_picto=true`
          const select = 'shortname_line,colourweb_hexa,textcolourweb_hexa,picto'
          const res = await fetch(`${IDFM_API}/records?where=${encodeURIComponent(where)}&select=${select}&limit=100`)
          if (!res.ok) return
          const data = await res.json()
          for (const record of data.results ?? []) {
            const line = record.shortname_line as string
            const key = `${mode}:${line}`
            if (!lineCache.has(key)) lineCache.set(key, recordToLine(record, mode))
          }
        } catch {}
      })
    ).then(() => {})
    return preloadPromise
  },
}
