import { api } from './api'

export interface Subscription {
  id: string
  payerId: string
  holderId: string | null
  holderLastName: string | null
  holderFirstName: string | null
  holderDateOfBirth: string | null
  offerId: string
  status: 'draft' | 'pending_documents' | 'pending_payment' | 'active' | 'suspended' | 'cancelled' | 'expired'
  fraudScore: number | null
  fraudLevel: string | null
  fraudSignals: unknown | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSubscriptionPayload {
  offerId: string
  holderId?: string
  holderLastName?: string
  holderFirstName?: string
  holderDateOfBirth?: string
}

export interface UpdateSubscriptionPayload {
  holderLastName?: string
  holderFirstName?: string
  holderDateOfBirth?: string
}

export const subscriptionsService = {
  create: (payload: CreateSubscriptionPayload) =>
    api.post<Subscription>('/subscriptions', payload).then((r) => r.data),

  findById: (id: string) =>
    api.get<Subscription>(`/subscriptions/${id}`).then((r) => r.data),

  update: (id: string, payload: UpdateSubscriptionPayload) =>
    api.patch<Subscription>(`/subscriptions/${id}`, payload).then((r) => r.data),

  confirm: (id: string) =>
    api.post<Subscription>(`/subscriptions/${id}/confirm`).then((r) => r.data),

  renew: (id: string) =>
    api.post<Subscription>(`/subscriptions/${id}/renew`).then((r) => r.data),
}
