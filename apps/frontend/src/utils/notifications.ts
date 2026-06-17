import type { SubscriptionSummary } from '../stores/authStore'
import { FORFAITS } from './tarifsData'
import { getExpiryDate, isExpired, isRenewalDue, type RenewalPeriod } from './subscriptionDates'
import { getDossierStageIndex } from './dossierStatus'
import { getAgeFromBirthDate, TRANSFER_AGE } from './childForfait'

export type NotificationLevel = 'info' | 'warning' | 'success'

export interface AppNotification {
  /** Identifiant déterministe — sert au suivi des notifications ignorées. */
  id: string
  level: NotificationLevel
  titleKey: string
  messageKey: string
  messageParams?: Record<string, string | number>
  /** Action optionnelle : libellé i18n + route de destination. */
  ctaKey?: string
  ctaTo?: string
}

/**
 * Dérive les notifications du cycle de vie à partir de l'abonnement courant.
 * 100 % côté client (pas de cron back) : échéance, expiration, statut dossier.
 */
export function buildNotifications(
  sub: SubscriptionSummary | null,
  now: number = Date.now(),
  locale = 'fr',
): AppNotification[] {
  const out: AppNotification[] = []

  if (!sub) {
    out.push({
      id: 'no-subscription',
      level: 'info',
      titleKey: 'notifications.items.noSubscription.title',
      messageKey: 'notifications.items.noSubscription.message',
      ctaKey: 'notifications.items.noSubscription.cta',
      ctaTo: '/souscrire',
    })
    return out
  }

  const period = FORFAITS.find((f) => f.id === sub.forfaitId)?.renouvellement as RenewalPeriod | undefined
  if (period) {
    const expiry = getExpiryDate(sub.startDate, period)
    const date = expiry ? expiry.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    if (isExpired(sub.startDate, period, now)) {
      out.push({
        id: `expired-${expiry?.toISOString()}`,
        level: 'warning',
        titleKey: 'notifications.items.expired.title',
        messageKey: 'notifications.items.expired.message',
        messageParams: { date },
        ctaKey: 'notifications.items.expired.cta',
        ctaTo: '/mon-espace',
      })
    } else if (isRenewalDue(sub.startDate, period, now)) {
      out.push({
        id: `renewal-${expiry?.toISOString()}`,
        level: 'warning',
        titleKey: 'notifications.items.renewalDue.title',
        messageKey: 'notifications.items.renewalDue.message',
        messageParams: { date },
        ctaKey: 'notifications.items.renewalDue.cta',
        ctaTo: '/mon-espace',
      })
    }
  }

  // Porteur mineur atteignant 16 ans → transfert possible.
  if (sub.beneficiary?.birthDate) {
    const age = getAgeFromBirthDate(sub.beneficiary.birthDate, now)
    if (age !== null && age >= TRANSFER_AGE) {
      out.push({
        id: `child16-${sub.beneficiary.birthDate}`,
        level: 'info',
        titleKey: 'notifications.items.child16.title',
        messageKey: 'notifications.items.child16.message',
        messageParams: { name: sub.beneficiary.firstName },
        ctaKey: 'notifications.items.child16.cta',
        ctaTo: '/mon-espace',
      })
    }
  }

  const stage = getDossierStageIndex(sub.submittedAt, now)
  if (stage >= 3) {
    out.push({
      id: `card-sent-${sub.submittedAt ?? 'legacy'}`,
      level: 'success',
      titleKey: 'notifications.items.cardSent.title',
      messageKey: 'notifications.items.cardSent.message',
    })
  } else {
    out.push({
      id: `dossier-${sub.submittedAt ?? 'legacy'}`,
      level: 'info',
      titleKey: 'notifications.items.dossierInProgress.title',
      messageKey: 'notifications.items.dossierInProgress.message',
    })
  }

  return out
}
