import type { Forfait, SimulateurParams } from '../types/domain'
import {
  FORFAITS,
  PRIX_LIBERTE_PLUS_PAR_TRAJET,
  PRIX_TICKET_UNITAIRE,
} from './tarifsData'

/** Tarif officiel IDFM 2026 du Navigo Jour, toutes zones (hors aéroports). */
export const PRIX_NAVIGO_JOUR = 12.30

export function calculerPrixLibertePlus(p: SimulateurParams): number {
  return Math.round(p.joursParSemaine * 52 * p.trajetsParJour * PRIX_LIBERTE_PLUS_PAR_TRAJET)
}

export function calculerPrixTickets(p: SimulateurParams): number {
  return Math.round(p.joursParSemaine * 52 * p.trajetsParJour * PRIX_TICKET_UNITAIRE)
}

/** Coût annuel du Navigo Jour selon l'usage réel : 1 pass acheté par jour de déplacement. */
export function calculerPrixNavigoJour(p: SimulateurParams): number {
  return Math.round(p.joursParSemaine * 52 * PRIX_NAVIGO_JOUR)
}

export function getPrixAnnuel(forfait: Forfait, p: SimulateurParams): number {
  if (forfait.id === 'liberte_plus') return calculerPrixLibertePlus(p)
  if (forfait.id === 'navigo_jour') return calculerPrixNavigoJour(p)
  if (forfait.prixAn === null) return Infinity
  return forfait.prixAn
}

export function getForfaitsEligibles(p: SimulateurParams): Forfait[] {
  return FORFAITS.filter((f) => {
    if (!f.profils.includes(p.profil)) return false
    if (f.condition && !f.condition(p)) return false
    return true
  })
}

export function classerParPrix(p: SimulateurParams): Forfait[] {
  return [...getForfaitsEligibles(p)].sort(
    (a, b) => getPrixAnnuel(a, p) - getPrixAnnuel(b, p),
  )
}

export function getEconomieVsTickets(forfait: Forfait, p: SimulateurParams): number {
  return calculerPrixTickets(p) - getPrixAnnuel(forfait, p)
}

/**
 * Calcule un score 0-100 indiquant la pertinence d'un forfait pour un profil.
 * Plus haut = plus pertinent.
 *
 * Heuristique :
 *  - +60 si éligible (sinon score = 0)
 *  - +20 si le profil correspond
 *  - +10 si fréquence d'usage cohérente avec la périodicité
 *  - −priorite (les forfaits "premium" remontent)
 */
export function scoreForfait(forfait: Forfait, p: SimulateurParams): number {
  if (forfait.eligible && !forfait.eligible(p)) return 0
  let score = 60
  if (forfait.profils.includes(p.profil)) score += 20
  if (forfait.condition && forfait.condition(p)) score += 10
  score -= forfait.priorite / 10
  return Math.max(0, Math.round(score))
}

export interface ForfaitRecommendation {
  forfait: Forfait
  score: number
  prixAn: number
  economieVsTickets: number
}

/**
 * Retourne tous les forfaits ordonnés par pertinence pour le profil donné.
 * Filtre ceux dont le score est 0 (non éligibles).
 */
export function recommendForfaits(p: SimulateurParams): ForfaitRecommendation[] {
  return FORFAITS
    .map((f) => ({
      forfait: f,
      score: scoreForfait(f, p),
      prixAn: getPrixAnnuel(f, p),
      economieVsTickets: getEconomieVsTickets(f, p),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.forfait.priorite - b.forfait.priorite)
}

/**
 * Le forfait le mieux noté pour un profil donné, ou null si aucun éligible.
 */
export function bestForfait(p: SimulateurParams): Forfait | null {
  const recs = recommendForfaits(p)
  return recs[0]?.forfait ?? null
}
