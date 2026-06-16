import type { Offer, PriceResult, SimulatorParams } from '../types/domain'
import { OFFERS, SINGLE_TICKET_PRICE } from './pricesData'

export function calculateLibertyPlusPrice(params: SimulatorParams): number {
  const tripPrice = 0.52
  const yearlyTrips = params.weeklyUsageDays * 52 * params.tripsPerDay
  return Math.round(yearlyTrips * tripPrice)
}

export function calculateTicketPrice(params: SimulatorParams): number {
  const yearlyTrips = params.weeklyUsageDays * 52 * params.tripsPerDay
  return Math.round(yearlyTrips * SINGLE_TICKET_PRICE)
}

export function getYearlyPrice(offer: Offer, params: SimulatorParams): number {
  if (offer.id === 'liberty_plus') return calculateLibertyPlusPrice(params)
  if (offer.yearlyPrice === null) return Number.POSITIVE_INFINITY
  return offer.yearlyPrice
}

export function getEligibleOffers(params: SimulatorParams): Offer[] {
  return OFFERS.filter((offer) => {
    const profileMatches = offer.profiles.includes(params.profile)
    const zonesMatch = params.zones >= offer.zones.min && params.zones <= offer.zones.max
    const conditionMatches = offer.condition ? offer.condition(params) : true
    return profileMatches && zonesMatch && conditionMatches
  })
}

export function rankOffers(params: SimulatorParams): PriceResult[] {
  const ticketPrice = calculateTicketPrice(params)
  const eligibleOffers = getEligibleOffers(params).sort(
    (a, b) => getYearlyPrice(a, params) - getYearlyPrice(b, params),
  )

  return eligibleOffers.map((offer, index) => {
    const yearlyPrice = getYearlyPrice(offer, params)
    return {
      offer,
      yearlyPrice,
      savingsVsTickets: Math.max(0, Math.round(ticketPrice - yearlyPrice)),
      eligible: true,
      recommended: index === 0,
      advice: getAdvice(offer, params),
    }
  })
}

function getAdvice(offer: Offer, params: SimulatorParams): string {
  if (offer.employerRefundRate && params.profile === 'employee') {
    return 'Votre employeur peut prendre en charge 50% du montant.'
  }
  if (offer.id.startsWith('solidarity')) {
    return 'Verification possible via les donnees publiques, sans upload de document.'
  }
  if (offer.requiredDocuments.length > 0) {
    return 'Preparez vos justificatifs, ils seront pre-verifies automatiquement.'
  }
  return 'Aucun justificatif requis pour demarrer la souscription.'
}
