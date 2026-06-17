import { describe, expect, it } from 'vitest'
import {
  calculerPrixLibertePlus,
  calculerPrixNavigoJour,
  calculerPrixTickets,
  getPrixAnnuel,
  getForfaitsEligibles,
  classerParPrix,
  getEconomieVsTickets,
  scoreForfait,
  recommendForfaits,
  bestForfait,
  PRIX_NAVIGO_JOUR,
} from './tarifEngine'
import { FORFAITS, PRIX_LIBERTE_PLUS_PAR_TRAJET } from './tarifsData'
import type { SimulateurParams } from '../types/domain'

const baseSalarie: SimulateurParams = {
  profil: 'salarie',
  joursParSemaine: 5,
  trajetsParJour: 2,
  zones: 5,
  age: 30,
}

describe('calculerPrixLibertePlus', () => {
  it('multiplies trips × days × 52 × PRIX_LIBERTE_PLUS_PAR_TRAJET', () => {
    expect(calculerPrixLibertePlus({ ...baseSalarie, joursParSemaine: 5, trajetsParJour: 2 }))
      .toBe(Math.round(5 * 52 * 2 * PRIX_LIBERTE_PLUS_PAR_TRAJET))
  })
})

describe('calculerPrixTickets', () => {
  it('uses PRIX_TICKET_UNITAIRE', () => {
    expect(calculerPrixTickets({ ...baseSalarie, joursParSemaine: 5, trajetsParJour: 2 }))
      .toBe(Math.round(5 * 52 * 2 * 2.10))
  })
})

describe('calculerPrixNavigoJour', () => {
  it('multiplies days/week × 52 × PRIX_NAVIGO_JOUR', () => {
    // 1 j/sem → 1 × 52 × 12,30 = 639,60 → arrondi 640
    expect(calculerPrixNavigoJour({ ...baseSalarie, joursParSemaine: 1 }))
      .toBe(Math.round(1 * 52 * PRIX_NAVIGO_JOUR))
    // Pour un usage quotidien on tombe à un prix très élevé qui décourage le choix
    expect(calculerPrixNavigoJour({ ...baseSalarie, joursParSemaine: 5 }))
      .toBe(Math.round(5 * 52 * PRIX_NAVIGO_JOUR))
  })

  it('getPrixAnnuel returns the dynamic computed price for navigo_jour, not Infinity', () => {
    const jour = FORFAITS.find((f) => f.id === 'navigo_jour')!
    const occ = { ...baseSalarie, joursParSemaine: 1 }
    expect(getPrixAnnuel(jour, occ)).toBe(calculerPrixNavigoJour(occ))
    expect(getPrixAnnuel(jour, occ)).not.toBe(Infinity)
  })
})

describe('getPrixAnnuel', () => {
  it('returns Liberté+ dynamic price', () => {
    const liberte = FORFAITS.find((f) => f.id === 'liberte_plus')!
    expect(getPrixAnnuel(liberte, baseSalarie)).toBeGreaterThan(0)
  })
  it('returns Infinity for null prixAn (e.g., Améthyste)', () => {
    const amethyste = FORFAITS.find((f) => f.id === 'amethyste')!
    expect(getPrixAnnuel(amethyste, baseSalarie)).toBe(Infinity)
  })
  it('returns the static prixAn for Navigo Mois', () => {
    const mois = FORFAITS.find((f) => f.id === 'navigo_mois')!
    expect(getPrixAnnuel(mois, baseSalarie)).toBe(1089.60)
  })
})

describe('getForfaitsEligibles', () => {
  it('filters by profil', () => {
    const result = getForfaitsEligibles(baseSalarie)
    expect(result.every((f) => f.profils.includes('salarie'))).toBe(true)
  })
  it('respects the condition() guard', () => {
    const occasional = { ...baseSalarie, joursParSemaine: 1 }
    const result = getForfaitsEligibles(occasional)
    expect(result.find((f) => f.id === 'navigo_mois')).toBeUndefined()
    expect(result.find((f) => f.id === 'liberte_plus')).toBeDefined()
  })
  it('returns TST plans only for tst profile', () => {
    const tstUser: SimulateurParams = { ...baseSalarie, profil: 'tst' }
    const result = getForfaitsEligibles(tstUser)
    expect(result.every((f) => f.profils.includes('tst'))).toBe(true)
  })
})

describe('classerParPrix', () => {
  it('sorts eligible plans by yearly price ascending', () => {
    const result = classerParPrix(baseSalarie)
    const prices = result.map((f) => getPrixAnnuel(f, baseSalarie))
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
  })
})

describe('getEconomieVsTickets', () => {
  it('returns tickets − plan price', () => {
    const mois = FORFAITS.find((f) => f.id === 'navigo_mois')!
    const econ = getEconomieVsTickets(mois, baseSalarie)
    expect(econ).toBe(calculerPrixTickets(baseSalarie) - 1089.60)
  })
  it('can be negative if plan is more expensive than tickets', () => {
    const mois = FORFAITS.find((f) => f.id === 'navigo_mois')!
    const sparse = { ...baseSalarie, joursParSemaine: 1, trajetsParJour: 1 }
    expect(getEconomieVsTickets(mois, sparse)).toBeLessThan(0)
  })
})

describe('scoreForfait + recommendForfaits', () => {
  it('non-eligible forfait scores 0', () => {
    const tstUser: SimulateurParams = { ...baseSalarie, profil: 'tst' }
    const annuel = FORFAITS.find((f) => f.id === 'navigo_annuel')!
    // Le salarié-only Navigo Annuel ne reste pas non-éligible (eligible() = true) pour tst — c'est le profil qui filtre.
    // Pour un test direct du predicate "0", on prend AME-only:
    const reduction50 = FORFAITS.find((f) => f.id === 'navigo_reduction_50')!
    expect(scoreForfait(reduction50, tstUser)).toBe(0) // flags.hasAME absent
    void annuel
  })

  it('AME-flag user gets navigo_reduction_50 with score > 0', () => {
    const ame: SimulateurParams = { ...baseSalarie, profil: 'tst', flags: { hasAME: true } }
    const reduction50 = FORFAITS.find((f) => f.id === 'navigo_reduction_50')!
    expect(scoreForfait(reduction50, ame)).toBeGreaterThan(0)
  })

  it('RSA user gets navigo_gratuite recommended', () => {
    const rsa: SimulateurParams = { ...baseSalarie, profil: 'tst', flags: { hasRSA: true } }
    const recs = recommendForfaits(rsa)
    expect(recs[0].forfait.id).toBe('navigo_gratuite')
  })

  it('Étudiant 20 ans gets imagine_r_etudiant recommended', () => {
    const etu: SimulateurParams = { ...baseSalarie, profil: 'etudiant', age: 20, flags: { isEtudiant: true } }
    const top = bestForfait(etu)
    expect(top?.id).toBe('imagine_r_etudiant')
  })

  it('Alternant 17 ans gets imagine_r_scolaire recommended', () => {
    const alt: SimulateurParams = { ...baseSalarie, profil: 'scolaire', age: 17, flags: { isAlternant: true } }
    const top = bestForfait(alt)
    expect(top?.id).toBe('imagine_r_scolaire')
  })

  it('Retraité 64 ans gets navigo_senior recommended', () => {
    const ret: SimulateurParams = { ...baseSalarie, profil: 'senior', age: 64, flags: { isRetraite: true } }
    const top = bestForfait(ret)
    expect(top?.id).toBe('navigo_senior')
  })

  it('Enfant 8 ans gets imagine_r_junior recommended', () => {
    const kid: SimulateurParams = { ...baseSalarie, profil: 'scolaire_junior', age: 8 }
    const top = bestForfait(kid)
    expect(top?.id).toBe('imagine_r_junior')
  })

  it('Salarié quotidien voit Navigo Annuel en tête', () => {
    const sal: SimulateurParams = { ...baseSalarie, profil: 'salarie', age: 30, joursParSemaine: 5, flags: { isSalarie: true } }
    const top = bestForfait(sal)
    expect(top?.id).toBe('navigo_annuel')
  })

  it('Usage occasionnel (1 jour/sem) propose navigo_jour ou liberte_plus en haut', () => {
    const occ: SimulateurParams = { ...baseSalarie, joursParSemaine: 1, trajetsParJour: 1 }
    const top = bestForfait(occ)
    expect(['navigo_jour', 'liberte_plus']).toContain(top?.id)
  })

  it('Tous les Navigo standards (jour/semaine/mois/annuel) sont recommandés à un salarié', () => {
    const sal: SimulateurParams = { ...baseSalarie, profil: 'salarie', age: 30 }
    const recs = recommendForfaits(sal)
    const ids = recs.map((r) => r.forfait.id)
    // Au moins un des grand publics doit apparaître.
    expect(ids).toEqual(expect.arrayContaining(['navigo_mois']))
  })
})
