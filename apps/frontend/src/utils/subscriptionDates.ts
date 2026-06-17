/**
 * Calcul d'échéance d'un abonnement à partir de sa date d'effet et de sa
 * périodicité. Fonctions pures, sans dépendance React — testables.
 */
export type RenewalPeriod = 'annuel' | 'mensuel' | 'trimestriel' | 'hebdomadaire' | 'usage' | 'jour'

/** Seuils « échéance proche » (jours avant expiration) selon la périodicité. */
const RENEWAL_THRESHOLD_DAYS: Record<RenewalPeriod, number> = {
  annuel: 30,
  trimestriel: 15,
  mensuel: 7,
  hebdomadaire: 2,
  jour: 1,
  usage: 0,
}

/** Date d'expiration, ou `null` pour un titre sans échéance (usage / Liberté+). */
export function getExpiryDate(startDate: string, period: RenewalPeriod): Date | null {
  const start = new Date(startDate)
  if (Number.isNaN(start.getTime()) || period === 'usage') return null
  const d = new Date(start)
  switch (period) {
    case 'annuel': d.setFullYear(d.getFullYear() + 1); break
    case 'trimestriel': d.setMonth(d.getMonth() + 3); break
    case 'mensuel': d.setMonth(d.getMonth() + 1); break
    case 'hebdomadaire': d.setDate(d.getDate() + 7); break
    case 'jour': d.setDate(d.getDate() + 1); break
  }
  return d
}

/** Jours restants avant expiration (négatif si déjà expiré), ou `null`. */
export function getDaysUntilExpiry(startDate: string, period: RenewalPeriod, now: number = Date.now()): number | null {
  const expiry = getExpiryDate(startDate, period)
  if (!expiry) return null
  return Math.ceil((expiry.getTime() - now) / 86_400_000)
}

/** Le renouvellement est-il à proposer (échéance proche ou dépassée) ? */
export function isRenewalDue(startDate: string, period: RenewalPeriod, now: number = Date.now()): boolean {
  const days = getDaysUntilExpiry(startDate, period, now)
  if (days === null) return false
  return days <= RENEWAL_THRESHOLD_DAYS[period]
}

export function isExpired(startDate: string, period: RenewalPeriod, now: number = Date.now()): boolean {
  const days = getDaysUntilExpiry(startDate, period, now)
  return days !== null && days < 0
}
