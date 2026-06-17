import { describe, expect, it } from 'vitest'
import { getAgeFromBirthDate, detectChildForfaitId } from './childForfait'

const REF = new Date('2026-06-17T00:00:00.000Z').getTime()

describe('getAgeFromBirthDate', () => {
  it('computes age accounting for the birthday in the year', () => {
    expect(getAgeFromBirthDate('2010-01-10', REF)).toBe(16)
    expect(getAgeFromBirthDate('2010-12-31', REF)).toBe(15)
  })
  it('returns null for an invalid date', () => {
    expect(getAgeFromBirthDate('nope', REF)).toBeNull()
  })
})

describe('detectChildForfaitId', () => {
  it('returns Junior under 11', () => {
    expect(detectChildForfaitId('2018-03-01', REF)).toBe('imagine_r_junior')
  })
  it('returns Scolaire from 11', () => {
    expect(detectChildForfaitId('2013-03-01', REF)).toBe('imagine_r_scolaire')
  })
  it('returns null for an invalid date', () => {
    expect(detectChildForfaitId('', REF)).toBeNull()
  })
})
