import { api } from './api'

export interface Gamification {
  points: number
  level: number
  badges: string[]
  nextLevelPoints: number
}

export const getGamification = () =>
  api.get<Gamification>('/users/me/gamification').then((r) => r.data)

/** Pourcentage de progression vers le niveau suivant (0–100, borné). */
export function progressPercent(points: number, nextLevelPoints: number): number {
  if (nextLevelPoints <= 0) return 100
  return Math.max(0, Math.min(100, Math.round((points / nextLevelPoints) * 100)))
}
