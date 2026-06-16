import { describe, expect, it } from 'vitest'
import { computeFraudScore, getFraudLevel, type FraudSignal } from './fraud-score.service'

describe('computeFraudScore', () => {
  it('returns 0 when no signal is triggered', () => {
    const signals: FraudSignal[] = [
      { name: 'a', weight: 1, triggered: false },
      { name: 'b', weight: 2, triggered: false },
    ]
    expect(computeFraudScore(signals)).toBe(0)
  })

  it('returns 100 when every signal is triggered', () => {
    const signals: FraudSignal[] = [
      { name: 'a', weight: 1, triggered: true },
      { name: 'b', weight: 2, triggered: true },
    ]
    expect(computeFraudScore(signals)).toBe(100)
  })

  it('weighs signals proportionally', () => {
    const signals: FraudSignal[] = [
      { name: 'a', weight: 1, triggered: true },
      { name: 'b', weight: 3, triggered: false },
    ]
    expect(computeFraudScore(signals)).toBe(25)
  })
})

describe('getFraudLevel', () => {
  it('classifies low/medium/high correctly at the boundaries', () => {
    expect(getFraudLevel(0)).toBe('low')
    expect(getFraudLevel(29)).toBe('low')
    expect(getFraudLevel(30)).toBe('medium')
    expect(getFraudLevel(64)).toBe('medium')
    expect(getFraudLevel(65)).toBe('high')
    expect(getFraudLevel(100)).toBe('high')
  })
})
