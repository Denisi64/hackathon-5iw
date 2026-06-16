import type { FraudLevel } from '../types/domain'

export interface FraudSignal {
  name: string
  weight: number
  triggered: boolean
  detail?: string
}

export function computeFraudScore(signals: FraudSignal[]): number {
  const max = signals.reduce((acc, s) => acc + s.weight * 100, 0)
  const actual = signals
    .filter((s) => s.triggered)
    .reduce((acc, s) => acc + s.weight * 100, 0)
  return Math.round((actual / max) * 100)
}

export function getFraudLevel(score: number): FraudLevel {
  if (score < 30) return 'low'
  if (score < 65) return 'medium'
  return 'high'
}
