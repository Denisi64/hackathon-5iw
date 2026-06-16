import { describe, expect, it } from 'vitest'
import { computeFraudScore, getFraudLevel } from './fraud-score.service'
import type { FraudSignal } from './fraud-score.service'

describe('computeFraudScore', () => {
  it('retourne 0 si aucun signal déclenché', () => {
    const signals: FraudSignal[] = [
      { name: 'low_ocr_confidence', weight: 3, triggered: false },
      { name: 'no_documents', weight: 2, triggered: false },
    ]
    expect(computeFraudScore(signals)).toBe(0)
  })

  it('retourne 100 si tous les signaux sont déclenchés avec poids égaux', () => {
    const signals: FraudSignal[] = [
      { name: 'a', weight: 1, triggered: true },
      { name: 'b', weight: 1, triggered: true },
    ]
    expect(computeFraudScore(signals)).toBe(100)
  })

  it('calcule correctement un score partiel', () => {
    const signals: FraudSignal[] = [
      { name: 'low_ocr', weight: 3, triggered: true },
      { name: 'no_docs', weight: 2, triggered: false },
      { name: 'mismatch', weight: 2, triggered: false },
      { name: 'rejected', weight: 3, triggered: false },
    ]
    // 3*100 / (3+2+2+3)*100 = 300/1000 = 30
    expect(computeFraudScore(signals)).toBe(30)
  })

  it('retourne 0 si aucun signal', () => {
    expect(computeFraudScore([])).toBe(0)
  })
})

describe('getFraudLevel', () => {
  it('low en dessous de 30', () => expect(getFraudLevel(0)).toBe('low'))
  it('low à 29', () => expect(getFraudLevel(29)).toBe('low'))
  it('medium à 30', () => expect(getFraudLevel(30)).toBe('medium'))
  it('medium à 64', () => expect(getFraudLevel(64)).toBe('medium'))
  it('high à 65', () => expect(getFraudLevel(65)).toBe('high'))
  it('high à 100', () => expect(getFraudLevel(100)).toBe('high'))
})
