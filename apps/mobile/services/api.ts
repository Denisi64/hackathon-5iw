import { API_BASE_URL } from '../constants/api'

const DEMO_MODE = true
const DEMO_PASSWORD = 'password123'

type DemoUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  profile?: string
  interests: string[]
  points: number
  level: number
  badges: string[]
}

type DemoSubscription = {
  id: string
  payerId: string
  offerId: string
  status: string
  startDate?: string
  endDate?: string
}

const todayIso = () => new Date().toISOString().split('T')[0]
const tokenFor = (email: string) => `demo:${email}`

const demoUsers: DemoUser[] = [
  { id: 'demo-jean', email: 'jean.dupont@test.com', firstName: 'Jean', lastName: 'Dupont', profile: 'employee', interests: ['worker', 'mobility'], points: 780, level: 2, badges: ['first_trip', 'tour_eiffel', 'streak_7'] },
  { id: 'demo-marie', email: 'marie.martin@test.com', firstName: 'Marie', lastName: 'Martin', profile: 'student', interests: ['student', 'travel'], points: 1180, level: 3, badges: ['first_trip', 'notre_dame', 'multimodal'] },
  { id: 'demo-lucas', email: 'lucas.bernard@test.com', firstName: 'Lucas', lastName: 'Bernard', profile: 'junior_school', interests: ['school'], points: 320, level: 1, badges: ['first_trip'] },
  { id: 'demo-emma', email: 'emma.petit@test.com', firstName: 'Emma', lastName: 'Petit', profile: 'school', interests: ['school'], points: 240, level: 1, badges: ['first_trip'] },
  { id: 'demo-robert', email: 'robert.moreau@test.com', firstName: 'Robert', lastName: 'Moreau', profile: 'senior', interests: ['senior'], points: 1540, level: 4, badges: ['first_trip', 'louvre', 'eco_warrior'] },
  { id: 'demo-fatima', email: 'fatima.benali@test.com', firstName: 'Fatima', lastName: 'Benali', profile: 'tst', interests: ['solidarity'], points: 640, level: 2, badges: ['first_trip', 'sacre_coeur'] },
  { id: 'demo-pierre', email: 'pierre.legrand@test.com', firstName: 'Pierre', lastName: 'Legrand', profile: 'amethyste', interests: ['accessibility'], points: 420, level: 1, badges: ['first_trip'] },
  { id: 'demo-sophie', email: 'sophie.dubois@test.com', firstName: 'Sophie', lastName: 'Dubois', profile: 'employee', interests: ['parent', 'worker'], points: 960, level: 2, badges: ['first_trip', 'versailles'] },
  { id: 'demo-karim', email: 'karim.mansouri@test.com', firstName: 'Karim', lastName: 'Mansouri', profile: 'tst', interests: ['solidarity'], points: 510, level: 2, badges: ['first_trip'] },
  { id: 'demo-alice', email: 'alice.renard@test.com', firstName: 'Alice', lastName: 'Renard', profile: 'employee', interests: ['worker'], points: 80, level: 1, badges: [] },
]

const demoOffers: BackendOffer[] = [
  { id: 'navigo_annuel', name: 'Navigo Annuel', description: 'Abonnement annuel tout reseau - 12e mois offert', yearlyPrice: 99880, monthlyPrice: 9080, renewal: 'annual', active: true },
  { id: 'navigo_senior', name: 'Navigo Annuel Senior', description: 'Tarif preferentiel 62 ans et plus', yearlyPrice: 54480, monthlyPrice: 4540, renewal: 'annual', active: true },
  { id: 'navigo_mois', name: 'Navigo Mois', description: 'Abonnement mensuel sans engagement', yearlyPrice: null, monthlyPrice: 9080, renewal: 'monthly', active: true },
  { id: 'navigo_semaine', name: 'Navigo Semaine', description: 'Forfait hebdomadaire du lundi au dimanche', yearlyPrice: 168480, monthlyPrice: 12960, renewal: 'weekly', active: true },
  { id: 'imagine_r_junior', name: 'Imagine R Junior', description: 'Enfants de moins de 11 ans', yearlyPrice: 2520, monthlyPrice: 210, renewal: 'annual', active: true },
  { id: 'imagine_r_scolaire', name: 'Imagine R Scolaire', description: 'Eleves de 11 a 25 ans', yearlyPrice: 40130, monthlyPrice: 3344, renewal: 'annual', active: true },
  { id: 'imagine_r_etudiant', name: 'Imagine R Etudiant', description: 'Etudiants de 18 a 28 ans', yearlyPrice: 40130, monthlyPrice: 3344, renewal: 'annual', active: true },
  { id: 'liberte_plus', name: 'Navigo Liberte+', description: "Paiement a l'usage", yearlyPrice: null, monthlyPrice: null, renewal: 'usage', active: true },
  { id: 'tst_50', name: 'TST Reduction 50%', description: 'Solidarite transport 50%', yearlyPrice: 54480, monthlyPrice: 4540, renewal: 'quarterly', active: true },
  { id: 'tst_75', name: 'TST Solidarite 75%', description: 'Solidarite transport 75%', yearlyPrice: 27240, monthlyPrice: 2270, renewal: 'quarterly', active: true },
  { id: 'tst_gratuite', name: 'TST Gratuite', description: 'Transport gratuit sous conditions', yearlyPrice: 0, monthlyPrice: 0, renewal: 'quarterly', active: true },
  { id: 'amethyste', name: 'Amethyste', description: 'Personnes reconnues handicapees', yearlyPrice: null, monthlyPrice: null, renewal: 'annual', active: true },
]

const demoSubscriptions: DemoSubscription[] = [
  { id: 'sub-jean-active', payerId: 'demo-jean', offerId: 'navigo_annuel', status: 'active', startDate: '2025-09-01', endDate: '2026-08-31' },
  { id: 'sub-marie-active', payerId: 'demo-marie', offerId: 'imagine_r_etudiant', status: 'active', startDate: '2025-09-01', endDate: '2026-08-31' },
  { id: 'sub-lucas-active', payerId: 'demo-lucas', offerId: 'imagine_r_junior', status: 'active', startDate: '2025-09-01', endDate: '2026-08-31' },
  { id: 'sub-emma-docs', payerId: 'demo-emma', offerId: 'imagine_r_scolaire', status: 'pending_documents' },
  { id: 'sub-robert-active', payerId: 'demo-robert', offerId: 'navigo_senior', status: 'active', startDate: '2025-09-01', endDate: '2026-08-31' },
  { id: 'sub-fatima-active', payerId: 'demo-fatima', offerId: 'tst_gratuite', status: 'active', startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'sub-pierre-payment', payerId: 'demo-pierre', offerId: 'amethyste', status: 'pending_payment' },
  { id: 'sub-sophie-active', payerId: 'demo-sophie', offerId: 'imagine_r_junior', status: 'active', startDate: '2025-09-01', endDate: '2026-08-31' },
  { id: 'sub-karim-active', payerId: 'demo-karim', offerId: 'tst_50', status: 'active', startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'sub-alice-draft', payerId: 'demo-alice', offerId: 'navigo_annuel', status: 'draft' },
]

const demoTripsByUser = new Map<string, TripItem[]>([
  ['demo-jean', [
    { id: 'trip-jean-1', line: 'M1', toLine: null, lineType: 'metro', from: 'Nation', to: 'La Defense', departureTime: '08:12', arrivalTime: '08:39', duration: 27, zones: [1], itineraryData: null, co2Saved: 2, tripDate: todayIso() },
    { id: 'trip-jean-2', line: 'A', toLine: null, lineType: 'rer', from: 'Charles de Gaulle - Etoile', to: 'Chatelet', departureTime: '18:04', arrivalTime: '18:10', duration: 6, zones: [1], itineraryData: null, co2Saved: 1, tripDate: todayIso() },
  ]],
  ['demo-marie', [
    { id: 'trip-marie-1', line: 'M4', toLine: null, lineType: 'metro', from: 'Saint-Michel', to: 'Gare du Nord', departureTime: '09:05', arrivalTime: '09:18', duration: 13, zones: [1], itineraryData: null, co2Saved: 1, tripDate: todayIso() },
  ]],
])

const demoFeed = [
  { id: 'employer-refund-tip', type: 'tip', title: 'Votre employeur rembourse 50%', body: 'Pensez a transmettre votre attestation Navigo a votre service RH.', emoji: 'info', tag: 'Conseil' },
  { id: 'tst-renouvellement', type: 'alert', title: 'Vos droits TST expirent bientot', body: 'Renouvelez votre attestation CAF avant la fin du trimestre.', emoji: 'info', tag: 'TST' },
  { id: 'new-line-alert', type: 'news', title: 'Trafic renforce ce week-end', body: 'Des renforts sont prevus sur plusieurs lignes franciliennes.', emoji: 'info', tag: 'Info' },
]

const demoAlerts = [
  { id: 'alert-m1', line: 'M1', lineType: 'metro', type: 'work', title: 'Travaux planifies', message: 'Trafic interrompu dimanche matin entre Nation et Bastille.', startDate: todayIso(), endDate: null },
  { id: 'alert-rera', line: 'A', lineType: 'rer', type: 'traffic', title: 'Affluence importante', message: 'Prevoir quelques minutes supplementaires aux heures de pointe.', startDate: todayIso(), endDate: null },
]

function bodyOf(options?: RequestInit): Record<string, unknown> {
  if (!options?.body || typeof options.body !== 'string') return {}
  try { return JSON.parse(options.body) as Record<string, unknown> } catch { return {} }
}

function bearerFrom(options?: RequestInit): string | null {
  const headers = options?.headers
  if (!headers) return null
  if (headers instanceof Headers) return headers.get('Authorization')?.replace('Bearer ', '') ?? null
  if (Array.isArray(headers)) {
    const found = headers.find(([key]) => key.toLowerCase() === 'authorization')
    return found?.[1]?.replace('Bearer ', '') ?? null
  }
  const value = (headers as Record<string, string>).Authorization ?? (headers as Record<string, string>).authorization
  return value?.replace('Bearer ', '') ?? null
}

function userFromToken(token: string | null): DemoUser {
  const email = token?.startsWith('demo:') ? token.slice(5) : demoUsers[0].email
  const user = demoUsers.find((item) => item.email === email)
  if (!user) throw new Error('Unauthorized')
  return user
}

function publicUser(user: DemoUser) {
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profile: user.profile }
}

function activeSubscription(userId: string): DemoSubscription | null {
  return demoSubscriptions.find((sub) => sub.payerId === userId && sub.status !== 'cancelled') ?? null
}

function offersForProfile(profile: string | null): BackendOffer[] {
  if (profile === 'student') return demoOffers.filter((offer) => ['imagine_r_etudiant', 'navigo_mois', 'liberte_plus'].includes(offer.id))
  if (profile === 'school') return demoOffers.filter((offer) => ['imagine_r_scolaire', 'imagine_r_junior', 'navigo_mois'].includes(offer.id))
  if (profile === 'junior_school') return demoOffers.filter((offer) => ['imagine_r_junior', 'imagine_r_scolaire'].includes(offer.id))
  if (profile === 'senior') return demoOffers.filter((offer) => ['navigo_senior', 'navigo_annuel', 'liberte_plus'].includes(offer.id))
  if (profile === 'tst') return demoOffers.filter((offer) => ['tst_gratuite', 'tst_75', 'tst_50'].includes(offer.id))
  if (profile === 'amethyste') return demoOffers.filter((offer) => ['amethyste', 'navigo_mois'].includes(offer.id))
  return demoOffers.filter((offer) => ['navigo_annuel', 'navigo_mois', 'liberte_plus'].includes(offer.id))
}

function tripsFor(userId: string): TripItem[] {
  return demoTripsByUser.get(userId) ?? []
}

async function demoRequest<T>(path: string, options?: RequestInit): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 120))
  const method = options?.method ?? 'GET'
  const body = bodyOf(options)
  const token = bearerFrom(options)
  const user = path.startsWith('/auth/login') || path.startsWith('/auth/register') || path.startsWith('/offers')
    ? null
    : userFromToken(token)

  if (path === '/auth/login' && method === 'POST') {
    const email = String(body.email ?? '').toLowerCase()
    const password = String(body.password ?? '')
    const found = demoUsers.find((item) => item.email === email)
    if (!found || password !== DEMO_PASSWORD) throw new Error('Identifiants invalides')
    return { accessToken: tokenFor(found.email), refreshToken: tokenFor(found.email), user: publicUser(found) } as T
  }

  if (path === '/auth/register' && method === 'POST') {
    const email = String(body.email ?? '').toLowerCase()
    let found = demoUsers.find((item) => item.email === email)
    if (!found) {
      found = {
        id: `demo-user-${Date.now()}`,
        email,
        firstName: String(body.firstName ?? 'Demo'),
        lastName: String(body.lastName ?? 'User'),
        profile: 'employee',
        interests: [],
        points: 0,
        level: 1,
        badges: [],
      }
      demoUsers.push(found)
    }
    return { accessToken: tokenFor(found.email), refreshToken: tokenFor(found.email), user: publicUser(found) } as T
  }

  if (path === '/auth/me') return publicUser(user!) as T

  if (path === '/users/me' && method === 'PATCH') {
    if (body.profile) user!.profile = String(body.profile)
    return { id: user!.id } as T
  }

  if (path === '/users/me/subscription') return activeSubscription(user!.id) as T
  if (path === '/users/me/notifications') {
    return [
      { id: 'notif-1', type: 'subscription_renewal', message: 'Votre abonnement est pret pour la demonstration.', readAt: null, createdAt: new Date().toISOString() },
      { id: 'notif-2', type: 'traffic_alert', message: 'Trafic charge sur votre ligne favorite.', readAt: null, createdAt: new Date().toISOString() },
    ] as T
  }
  if (path === '/users/me/gamification') {
    return { points: user!.points, level: user!.level, badges: user!.badges, nextLevelPoints: user!.level * 500 } as T
  }
  if (path === '/users/me/interests' && method === 'PATCH') {
    user!.interests = Array.isArray(body.interests) ? body.interests.map(String) : []
    return { id: user!.id, interests: user!.interests } as T
  }
  if (path === '/users/me/interests') return { interests: user!.interests } as T
  if (path === '/users/leaderboard') {
    return [...demoUsers]
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((entry, index) => ({ rank: index + 1, firstName: entry.firstName, lastName: entry.lastName, points: entry.points, level: entry.level, badgeCount: entry.badges.length, isMe: entry.id === user!.id })) as T
  }

  if (path === '/feed') return demoFeed as T

  if (path === '/trips/today') {
    const trips = tripsFor(user!.id).filter((trip) => trip.tripDate === todayIso())
    return { date: todayIso(), totalTrips: trips.length, totalDuration: trips.reduce((sum, trip) => sum + trip.duration, 0), totalCo2Saved: trips.reduce((sum, trip) => sum + trip.co2Saved, 0), trips } as T
  }
  if (path === '/trips/week') {
    const trips = tripsFor(user!.id)
    return { weekTrips: trips.length, weekDuration: trips.reduce((sum, trip) => sum + trip.duration, 0), weekCo2Saved: trips.reduce((sum, trip) => sum + trip.co2Saved, 0), weekKm: Math.max(1, trips.length * 8), mostUsedLine: trips[0]?.line ?? null, streak: Math.min(7, Math.max(1, trips.length)) } as T
  }
  if (path === '/trips/stats') {
    const trips = tripsFor(user!.id)
    return { totalTrips: trips.length, totalCo2Saved: trips.reduce((sum, trip) => sum + trip.co2Saved, 0), totalKm: Math.max(1, trips.length * 8), weeksActive: Math.max(1, Math.ceil(trips.length / 3)) } as T
  }
  if (path === '/trips/favorites') return [{ line: 'M1', lineType: 'metro', count: 8 }, { line: 'A', lineType: 'rer', count: 5 }] as T
  if (path === '/trips/alerts') return demoAlerts as T
  if (path === '/trips/history') return tripsFor(user!.id) as T
  if (path === '/trips/log' && method === 'POST') {
    const trip = body as unknown as LogTripDto
    const created: TripItem = {
      id: `trip-${Date.now()}`,
      line: trip.line,
      toLine: trip.toLine ?? null,
      lineType: trip.lineType,
      from: trip.from,
      to: trip.to,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      duration: trip.duration,
      zones: trip.zones,
      itineraryData: trip.itineraryData ?? null,
      co2Saved: trip.co2Saved,
      tripDate: todayIso(),
    }
    demoTripsByUser.set(user!.id, [created, ...tripsFor(user!.id)])
    user!.points += 15
    return created as T
  }

  if (path === '/offers') return demoOffers as T
  if (path.startsWith('/offers?')) {
    const query = path.split('?')[1] ?? ''
    const profile = new URLSearchParams(query).get('profile')
    return offersForProfile(profile) as T
  }

  if (path === '/subscriptions' && method === 'POST') {
    const sub: DemoSubscription = { id: `sub-${Date.now()}`, payerId: user!.id, offerId: String(body.offerId), status: 'pending_documents' }
    demoSubscriptions.unshift(sub)
    return { id: sub.id } as T
  }
  if (path.startsWith('/subscriptions/') && path.endsWith('/confirm') && method === 'POST') {
    const id = path.split('/')[2]
    const sub = demoSubscriptions.find((item) => item.id === id)
    if (sub) {
      sub.status = 'active'
      sub.startDate = todayIso()
      sub.endDate = '2026-08-31'
    }
    return undefined as T
  }
  if (path.startsWith('/subscriptions/') && method === 'DELETE') {
    const id = path.split('/')[2]
    const sub = demoSubscriptions.find((item) => item.id === id)
    if (sub) sub.status = 'cancelled'
    return undefined as T
  }

  throw new Error(`Demo route not implemented: ${method} ${path}`)
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (DEMO_MODE) return demoRequest<T>(path, options)

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
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (path === '/documents/verify') {
      return { id: `doc-${Date.now()}`, valid: true, confidence: 91, documentType: 'cni', issues: [] } as T
    }
    if (path === '/documents') {
      return { id: `doc-${Date.now()}`, status: 'valid' } as T
    }
  }

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
    if (DEMO_MODE) {
      const last = messages[messages.length - 1]?.content.toLowerCase() ?? ''
      const response = last.includes('enfant')
        ? "Pour un enfant, regardez Imagine R Junior ou Imagine R Scolaire selon l'age. Le parcours de souscription permet de simuler les justificatifs et le paiement dans cette demo."
        : last.includes('tst') || last.includes('amethyste')
          ? "La TST concerne les droits solidarite transport. Amethyste vise les publics eligibles via leur departement. Dans cette demo, les comptes Fatima, Karim et Pierre montrent ces cas."
          : last.includes('employeur')
            ? "Pour un salarie, Navigo Annuel est souvent le plus adapte. L'employeur rembourse generalement 50% de l'abonnement domicile-travail."
            : "Je peux vous guider dans le choix d'un abonnement. Pour tester sans backend, utilisez les comptes demo et parcourez les offres, documents, paiement et trajets."
      for (const chunk of response.match(/.{1,70}(\s|$)/g) ?? [response]) {
        await new Promise((resolve) => setTimeout(resolve, 80))
        onChunk(chunk)
      }
      return
    }

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
