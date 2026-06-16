import type { Forfait, SimulateurParams, TarifResultat } from '../types/domain'
import { FORFAITS, PRIX_TICKET_UNITAIRE } from './tarifsData'

export function calculerPrixLibertePlus(params: SimulateurParams): number {
  const prixParTrajet = 0.52
  const trajetsAnnuels = params.joursParSemaine * 52 * params.trajetsParJour
  return Math.round(trajetsAnnuels * prixParTrajet)
}

export function calculerPrixTickets(params: SimulateurParams): number {
  const trajetsAnnuels = params.joursParSemaine * 52 * params.trajetsParJour
  return Math.round(trajetsAnnuels * PRIX_TICKET_UNITAIRE)
}

export function getPrixAnnuel(forfait: Forfait, params: SimulateurParams): number {
  if (forfait.id === 'liberte_plus') return calculerPrixLibertePlus(params)
  if (forfait.prixAn === null) return Number.POSITIVE_INFINITY
  return forfait.prixAn
}

export function getEligibleForfaits(params: SimulateurParams): Forfait[] {
  return FORFAITS.filter((forfait) => {
    const profilMatch = forfait.profils.includes(params.profil)
    const zonesMatch = params.zones >= forfait.zones.min && params.zones <= forfait.zones.max
    const conditionMatch = forfait.condition ? forfait.condition(params) : true
    return profilMatch && zonesMatch && conditionMatch
  })
}

export function classerForfaits(params: SimulateurParams): TarifResultat[] {
  const prixTickets = calculerPrixTickets(params)
  const eligibles = getEligibleForfaits(params).sort(
    (a, b) => getPrixAnnuel(a, params) - getPrixAnnuel(b, params),
  )

  return eligibles.map((forfait, index) => {
    const prixAnnuel = getPrixAnnuel(forfait, params)
    return {
      forfait,
      prixAnnuel,
      economieVsTickets: Math.max(0, Math.round(prixTickets - prixAnnuel)),
      eligible: true,
      recommended: index === 0,
      conseil: getConseil(forfait, params),
    }
  })
}

function getConseil(forfait: Forfait, params: SimulateurParams): string {
  if (forfait.remboursementEmployeur && params.profil === 'salarie') {
    return 'Votre employeur peut prendre en charge 50% du montant.'
  }
  if (forfait.id.startsWith('tst')) {
    return 'Verification possible via les donnees publiques, sans upload de document.'
  }
  if (forfait.justificatifsRequis.length > 0) {
    return 'Preparez vos justificatifs, ils seront pre-verifies automatiquement.'
  }
  return 'Aucun justificatif requis pour demarrer la souscription.'
}
