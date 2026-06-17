import { describe, expect, it } from 'vitest'
import { buildNotifications } from './notifications'
import type { SubscriptionSummary } from '../stores/authStore'

const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86_400_000).toISOString()

function sub(overrides: Partial<SubscriptionSummary> = {}): SubscriptionSummary {
  return {
    forfaitId: 'navigo_annuel',
    forfaitNom: 'Navigo Annuel',
    prixAn: 1000,
    prixMois: 90,
    startDate: iso(0),
    zones: 5,
    submittedAt: iso(0),
    ...overrides,
  }
}

describe('buildNotifications', () => {
  it('invites a user without subscription to subscribe', () => {
    const n = buildNotifications(null)
    expect(n).toHaveLength(1)
    expect(n[0].id).toBe('no-subscription')
    expect(n[0].ctaTo).toBe('/souscrire')
  })

  it('shows a dossier-in-progress notification for a fresh subscription', () => {
    const n = buildNotifications(sub())
    expect(n.some((x) => x.id.startsWith('dossier-'))).toBe(true)
    expect(n.some((x) => x.id.startsWith('renewal-') || x.id.startsWith('expired-'))).toBe(false)
  })

  it('warns when the subscription has expired', () => {
    const n = buildNotifications(sub({ startDate: iso(-400), submittedAt: iso(-400) }))
    const expired = n.find((x) => x.id.startsWith('expired-'))
    expect(expired?.level).toBe('warning')
    expect(expired?.ctaTo).toBe('/mon-espace')
    // dossier terminé depuis longtemps → carte envoyée
    expect(n.some((x) => x.id.startsWith('card-sent-'))).toBe(true)
  })

  it('flags an upcoming renewal within the threshold window', () => {
    const n = buildNotifications(sub({ startDate: iso(-345), submittedAt: iso(-345) }))
    expect(n.some((x) => x.id.startsWith('renewal-') && x.level === 'warning')).toBe(true)
  })
})
