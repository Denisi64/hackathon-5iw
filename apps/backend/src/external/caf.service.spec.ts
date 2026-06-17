import { describe, expect, it } from 'vitest'
import { computeTSTLevel } from './caf.service'

describe('computeTSTLevel', () => {
  it('returns tst_gratuite at or below 400', () => {
    expect(computeTSTLevel(0)).toBe('tst_gratuite')
    expect(computeTSTLevel(400)).toBe('tst_gratuite')
  })

  it('returns tst_75 between 401 and 600', () => {
    expect(computeTSTLevel(401)).toBe('tst_75')
    expect(computeTSTLevel(600)).toBe('tst_75')
  })

  it('returns tst_50 between 601 and 800', () => {
    expect(computeTSTLevel(601)).toBe('tst_50')
    expect(computeTSTLevel(800)).toBe('tst_50')
  })

  it('returns null above 800', () => {
    expect(computeTSTLevel(801)).toBeNull()
    expect(computeTSTLevel(9999)).toBeNull()
  })
})
