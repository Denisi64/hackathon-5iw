import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Baby, Calendar, CheckCircle2, ChevronRight, FileCheck2, KeyRound, LogOut, MapPin, RefreshCw, Sparkles, UserRound } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { DossierStepper } from '../components/domain/DossierStepper'
import { useAuthStore } from '../stores/authStore'
import { FORFAITS } from '../utils/tarifsData'
import { getExpiryDate, isExpired, isRenewalDue, type RenewalPeriod } from '../utils/subscriptionDates'
import { getAgeFromBirthDate, TRANSFER_AGE } from '../utils/childForfait'
import { formatCurrency } from '../lib/formatters'
import { useLocale } from '../hooks/useLocale'

export default function MonEspaceScreen() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)!
  const logout = useAuthStore((s) => s.logout)
  const setSubscription = useAuthStore((s) => s.setSubscription)
  const [justRenewed, setJustRenewed] = useState(false)
  const [transferProposed, setTransferProposed] = useState(false)

  function onLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const sub = user.subscription
  const startDateStr = sub
    ? new Date(sub.startDate).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const period = (sub && FORFAITS.find((f) => f.id === sub.forfaitId)?.renouvellement) as RenewalPeriod | undefined
  const expiry = sub && period ? getExpiryDate(sub.startDate, period) : null
  const renewalDue = sub && period ? isRenewalDue(sub.startDate, period) : false
  const expired = sub && period ? isExpired(sub.startDate, period) : false

  // Renouvellement « 1 clic » : nouvelle période enchaînée sur l'échéance, dossier re-soumis.
  function onRenew() {
    if (!sub) return
    const now = new Date()
    const base = expiry && expiry.getTime() > now.getTime() ? expiry : now
    setSubscription({ ...sub, startDate: base.toISOString(), submittedAt: now.toISOString() })
    setJustRenewed(true)
  }

  return (
    <div className="flex flex-col gap-10 pb-10">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs tracking-widest uppercase text-fg-muted">{t('monEspace.kicker')}</span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            <span className="bg-gradient-to-b from-fg via-fg to-fg/60 bg-clip-text text-transparent">
              {t('monEspace.welcome', { firstName: user.firstName })}
            </span>
          </h1>
          <Button variant="ghost" size="sm" onClick={onLogout} leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}>
            {t('monEspace.logout')}
          </Button>
        </div>
        <p className="text-fg-muted">{t('monEspace.subtitle')}</p>
      </header>

      {sub ? (
        <Card variant="feature" spotlight>
          <Card.Body>
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="success" icon={<Sparkles className="h-3 w-3" aria-hidden="true" />}>{t('monEspace.subscriptionActive')}</Badge>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg">{sub.forfaitNom}</h2>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('simulator.perYear')}</p>
                  <p className="text-2xl font-semibold tracking-tight text-fg tabular-nums">
                    {sub.prixAn !== null ? formatCurrency(sub.prixAn, locale) : '—'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Stat icon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />} label={t('monEspace.startDate')} value={startDateStr ?? '—'} />
                <Stat icon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />} label={t('monEspace.zones')} value={`1 – ${sub.zones}`} />
              </div>

              <div className="mt-3 rounded-xl bg-surface border border-border-default p-4">
                <DossierStepper submittedAt={sub.submittedAt} />
              </div>

              {/* Renouvellement */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface border border-border-default p-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('monEspace.renewal.title')}</span>
                  {expiry ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-fg">
                        {t('monEspace.renewal.expiresOn', {
                          date: expiry.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
                        })}
                      </span>
                      {expired ? (
                        <Badge variant="warning">{t('monEspace.renewal.expired')}</Badge>
                      ) : renewalDue ? (
                        <Badge variant="warning">{t('monEspace.renewal.dueSoon')}</Badge>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-sm text-fg-muted">{t('monEspace.renewal.noExpiry')}</span>
                  )}
                  {justRenewed && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('monEspace.renewal.renewed')}
                    </span>
                  )}
                </div>
                {expiry && (
                  <Button
                    variant={renewalDue || expired ? 'primary' : 'secondary'}
                    size="md"
                    onClick={onRenew}
                    leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
                  >
                    {t('monEspace.renewal.cta')}
                  </Button>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card spotlight>
          <Card.Body>
            <div className="flex flex-col items-start gap-4 py-2">
              <Badge variant="info">{t('monEspace.empty.kicker')}</Badge>
              <h2 className="text-xl font-semibold tracking-tight text-fg">{t('monEspace.empty.title')}</h2>
              <p className="text-fg-muted">{t('monEspace.empty.description')}</p>
              <Button size="md" onClick={() => navigate('/souscrire')} rightIcon={<ChevronRight className="h-4 w-4" aria-hidden="true" />}>
                {t('monEspace.empty.cta')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {sub?.beneficiary && (() => {
        const age = sub.beneficiary.birthDate ? getAgeFromBirthDate(sub.beneficiary.birthDate) : null
        const canTransfer = age !== null && age >= TRANSFER_AGE
        const isChild = !!sub.beneficiary.birthDate
        const fullName = sub.beneficiary.lastName ? `${sub.beneficiary.firstName} ${sub.beneficiary.lastName}` : sub.beneficiary.firstName
        return (
          <Card>
            <Card.Body>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      {isChild ? <Baby className="h-5 w-5" aria-hidden="true" /> : <UserRound className="h-5 w-5" aria-hidden="true" />}
                    </span>
                    <div>
                      <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('monEspace.porteur.title')}</span>
                      <h3 className="text-lg font-semibold tracking-tight text-fg">
                        {fullName}
                        {age !== null && age >= 0 && <span className="ml-2 text-sm font-normal text-fg-muted">· {t('monEspace.porteur.age', { age })}</span>}
                      </h3>
                    </div>
                  </div>
                  <Badge variant="neutral">{t('monEspace.porteur.readOnly')}</Badge>
                </div>

                {/* Vue lecture seule — pas de prix, pas de RIB, pas de justificatifs. */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Stat icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />} label={t('monEspace.subscriptionActive')} value={sub.forfaitNom} />
                  <Stat icon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />} label={t('monEspace.zones')} value={`1 – ${sub.zones}`} />
                  <Stat icon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />} label={t('monEspace.porteur.expiry')} value={expiry ? expiry.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
                </div>

                {canTransfer && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface border border-border-default p-4">
                    <div className="flex items-start gap-2.5">
                      <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold text-fg">{t('monEspace.porteur.transferTitle')}</p>
                        <p className="mt-0.5 text-sm text-fg-muted">{t('monEspace.porteur.transferDescription', { name: sub.beneficiary.firstName })}</p>
                        {transferProposed && (
                          <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('monEspace.porteur.transferDone', { name: sub.beneficiary.firstName })}
                          </span>
                        )}
                      </div>
                    </div>
                    {!transferProposed && (
                      <Button variant="secondary" size="md" onClick={() => setTransferProposed(true)} leftIcon={<KeyRound className="h-4 w-4" aria-hidden="true" />}>
                        {t('monEspace.porteur.transferCta')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        )
      })()}

      {sub?.documents && sub.documents.length > 0 && (
        <Card>
          <Card.Body>
            <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('monEspace.documents.title')}</span>
            <ul className="mt-3 flex flex-col gap-2">
              {sub.documents.map((doc) => (
                <li
                  key={doc.key}
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface border border-border-default px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck2 className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span className="truncate text-sm text-fg">{t(`subscription.documents.${doc.key}.label`)}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden sm:inline text-xs text-fg-muted tabular-nums">
                      {new Date(doc.verifiedAt).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <Badge variant="success">{t('monEspace.documents.verified')}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <Card.Body>
            <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('monEspace.account')}</span>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-fg">{user.firstName} {user.lastName}</h3>
            <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('monEspace.actions')}</span>
            <ul className="mt-3 flex flex-col gap-2">
              <ActionItem to="/simulateur" label={t('monEspace.action.simulate')} />
              <ActionItem to="/histoires/lucas" label={t('monEspace.action.stories')} />
              <ActionItem to="/souscrire" label={t('monEspace.action.newSubscription')} />
            </ul>
          </Card.Body>
        </Card>
      </section>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface border border-border-default p-3">
      <div className="flex items-center gap-1.5 text-fg-muted">
        {icon}
        <span className="font-mono text-[10px] tracking-widest uppercase">{label}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-fg">{value}</p>
    </div>
  )
}

function ActionItem({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link to={to} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-surface transition-colors text-sm text-fg">
        <span>{label}</span>
        <ChevronRight className="h-3.5 w-3.5 text-fg-muted" aria-hidden="true" />
      </Link>
    </li>
  )
}
