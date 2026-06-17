import { describe, expect, it } from 'vitest'
import { getDossierStageIndex, isDossierComplete } from './dossierStatus'

const at = (secondsAgo: number) => new Date(Date.now() - secondsAgo * 1000).toISOString()

describe('getDossierStageIndex', () => {
  it('returns "submitted" (0) right after submission', () => {
    expect(getDossierStageIndex(at(5))).toBe(0)
  })
  it('advances to "processing" (1) after 20s', () => {
    expect(getDossierStageIndex(at(30))).toBe(1)
  })
  it('advances to "validated" (2) after 60s', () => {
    expect(getDossierStageIndex(at(90))).toBe(2)
  })
  it('reaches "cardSent" (3) after 150s', () => {
    expect(getDossierStageIndex(at(200))).toBe(3)
  })
  it('treats legacy subscriptions without submittedAt as validated', () => {
    expect(getDossierStageIndex(undefined)).toBe(2)
  })
  it('falls back to validated on an invalid date', () => {
    expect(getDossierStageIndex('not-a-date')).toBe(2)
  })
})

describe('isDossierComplete', () => {
  it('is false while progressing', () => {
    expect(isDossierComplete(at(30))).toBe(false)
  })
  it('is true once the card is sent', () => {
    expect(isDossierComplete(at(200))).toBe(true)
  })
})
