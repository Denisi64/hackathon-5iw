import type { Plan, SimulatorParams } from './domain'
import {
  PLANS,
  LIBERTE_PLUS_PRICE_PER_TRIP,
  SINGLE_TICKET_PRICE,
} from './faresData'

/** Official 2026 IDFM Navigo Day fare, all zones excluding airports. */
export const NAVIGO_DAY_PRICE = 12.30

export function calculateLibertePlusPrice(p: SimulatorParams): number {
  return Math.round(p.daysPerWeek * 52 * p.tripsPerDay * LIBERTE_PLUS_PRICE_PER_TRIP)
}

export function calculateTicketPrice(p: SimulatorParams): number {
  return Math.round(p.daysPerWeek * 52 * p.tripsPerDay * SINGLE_TICKET_PRICE)
}

/** Yearly Navigo Day cost based on actual usage: one pass per travel day. */
export function calculateNavigoDayPrice(p: SimulatorParams): number {
  return Math.round(p.daysPerWeek * 52 * NAVIGO_DAY_PRICE)
}

export function getAnnualPrice(plan: Plan, p: SimulatorParams): number {
  if (plan.id === 'liberty_plus') return calculateLibertePlusPrice(p)
  if (plan.id === 'navigo_day') return calculateNavigoDayPrice(p)
  if (plan.yearlyPrice === null) return Infinity
  return plan.yearlyPrice
}

export function getEligiblePlans(p: SimulatorParams): Plan[] {
  return PLANS.filter((f) => {
    if (!f.profiles.includes(p.profile)) return false
    if (f.condition && !f.condition(p)) return false
    return true
  })
}

export function sortByPrice(p: SimulatorParams): Plan[] {
  return [...getEligiblePlans(p)].sort(
    (a, b) => getAnnualPrice(a, p) - getAnnualPrice(b, p),
  )
}

export function getSavingsVsTickets(plan: Plan, p: SimulatorParams): number {
  return calculateTicketPrice(p) - getAnnualPrice(plan, p)
}

/**
 * Computes a 0-100 relevance score for a plan and profile.
 * Higher is more relevant.
 *
 * Heuristic:
 *  - +60 when eligible, otherwise score is 0
 *  - +20 when the profile matches
 *  - +10 when usage frequency matches the cadence
 *  - minus priority so preferred products rise up
 */
export function scorePlan(plan: Plan, p: SimulatorParams): number {
  if (plan.eligible && !plan.eligible(p)) return 0
  let score = 60
  if (plan.profiles.includes(p.profile)) score += 20
  if (plan.condition && plan.condition(p)) score += 10
  score -= plan.priority / 10
  return Math.max(0, Math.round(score))
}

export interface PlanRecommendation {
  plan: Plan
  score: number
  yearlyPrice: number
  savingsVsTickets: number
}

/**
 * Returns all plans ordered by relevance for the given profile.
 * Filters out plans with a score of 0.
 */
export function recommendPlans(p: SimulatorParams): PlanRecommendation[] {
  return PLANS
    .map((f) => ({
      plan: f,
      score: scorePlan(f, p),
      yearlyPrice: getAnnualPrice(f, p),
      savingsVsTickets: getSavingsVsTickets(f, p),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.plan.priority - b.plan.priority)
}

/**
 * Returns the highest-ranked plan for a profile, or null when none applies.
 */
export function bestPlan(p: SimulatorParams): Plan | null {
  const recs = recommendPlans(p)
  return recs[0]?.plan ?? null
}
