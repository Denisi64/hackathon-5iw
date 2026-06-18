import { api } from './api'

export interface Notification {
  id: string
  userId: string
  type: string
  message: string
  readAt: string | null
  createdAt: string
}

export const notificationsService = {
  getAll: () =>
    api.get<Notification[]>('/users/me/notifications').then((r) => r.data),

  markRead: (id: string) =>
    api.patch<Notification>(`/users/me/notifications/${id}/read`).then((r) => r.data),
}
