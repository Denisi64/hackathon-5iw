import { api } from './api'

export const getInterests = () =>
  api.get<{ interests: string[] }>('/users/me/interests').then((r) => r.data.interests)

export const updateInterests = (interests: string[]) =>
  api.patch<{ id: string; interests: string[] }>('/users/me/interests', { interests }).then((r) => r.data.interests)
