import { describe, expect, it } from 'vitest'
import { progressPercent } from './gamification'

describe('progressPercent', () => {
  it('calcule un pourcentage borné', () => {
    expect(progressPercent(50, 100)).toBe(50)
    expect(progressPercent(0, 100)).toBe(0)
  })
  it('borne au-dessus de 100 et gère un seuil nul', () => {
    expect(progressPercent(150, 100)).toBe(100)
    expect(progressPercent(10, 0)).toBe(100)
  })
})
