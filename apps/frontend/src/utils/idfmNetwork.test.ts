import { describe, expect, it } from 'vitest'
import { findItinerary, lineColor } from './idfmNetwork'

describe('lineColor', () => {
  it('retourne la couleur officielle (M1 jaune)', () => {
    expect(lineColor('M1')).toBe('#ffbe00')
  })
  it('repli gris pour une ligne inconnue', () => {
    expect(lineColor('ZZ')).toBe('#6B7A99')
  })
})

describe('findItinerary', () => {
  it('même ligne → 0 correspondance', () => {
    const it = findItinerary('M1', 'Bastille', 'M1', 'Nation')
    expect(it.transfers).toHaveLength(0)
    expect(it.legs).toHaveLength(1)
  })
  it('lignes différentes via un hub → au moins 1 correspondance', () => {
    const it = findItinerary('M1', 'Bastille', 'M4', 'Châtelet')
    expect(it.legs.length).toBeGreaterThanOrEqual(2)
    expect(it.transfers.length).toBeGreaterThanOrEqual(1)
  })
})
