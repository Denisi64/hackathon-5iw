import { describe, expect, it } from 'vitest'
import { getExpiryDate, getDaysUntilExpiry, isRenewalDue, isExpired } from './subscriptionDates'

const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString()

describe('getExpiryDate', () => {
  it('adds one year for an annual pass', () => {
    const expiry = getExpiryDate('2026-01-15T00:00:00.000Z', 'annuel')
    expect(expiry?.getUTCFullYear()).toBe(2027)
    expect(expiry?.getUTCMonth()).toBe(0)
  })
  it('adds three months for a quarterly pass', () => {
    const expiry = getExpiryDate('2026-01-15T00:00:00.000Z', 'trimestriel')
    expect(expiry?.getUTCMonth()).toBe(3)
  })
  it('returns null for an usage-based pass', () => {
    expect(getExpiryDate('2026-01-15T00:00:00.000Z', 'usage')).toBeNull()
  })
  it('returns null for an invalid date', () => {
    expect(getExpiryDate('nope', 'annuel')).toBeNull()
  })
})

describe('getDaysUntilExpiry', () => {
  it('is roughly the remaining period for a fresh annual pass', () => {
    const days = getDaysUntilExpiry(daysFromNow(0), 'annuel')
    expect(days).toBeGreaterThan(360)
  })
})

describe('isRenewalDue', () => {
  it('is false for a pass that started today (annual)', () => {
    expect(isRenewalDue(daysFromNow(0), 'annuel')).toBe(false)
  })
  it('is true within 30 days of an annual expiry', () => {
    expect(isRenewalDue(daysFromNow(-345), 'annuel')).toBe(true)
  })
  it('is true once expired', () => {
    expect(isRenewalDue(daysFromNow(-400), 'annuel')).toBe(true)
  })
  it('is never due for an usage pass', () => {
    expect(isRenewalDue(daysFromNow(-400), 'usage')).toBe(false)
  })
})

describe('isExpired', () => {
  it('is true past the expiry date', () => {
    expect(isExpired(daysFromNow(-400), 'annuel')).toBe(true)
  })
  it('is false while still valid', () => {
    expect(isExpired(daysFromNow(-10), 'annuel')).toBe(false)
  })
})
