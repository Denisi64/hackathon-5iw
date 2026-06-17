import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, ChevronRight, LogOut, MapPin, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useAuthStore } from '../stores/authStore'
import { formatCurrency } from '../lib/formatters'
import { useLocale } from '../hooks/useLocale'
import { FORFAITS } from '../utils/tarifsData'
import { getForfaitName } from '../utils/forfaitDisplay'

export default function MonEspaceScreen() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)!
  const logout = useAuthStore((s) => s.logout)

  function onLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const sub = user.subscription
  const activeForfait = sub ? FORFAITS.find((forfait) => forfait.id === sub.forfaitId) : undefined
  const startDateStr = sub
    ? new Date(sub.startDate).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : null

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
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg">
                    {activeForfait ? getForfaitName(activeForfait, t) : sub.forfaitNom}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('simulator.perYear')}</p>
                  <p className="text-2xl font-semibold tracking-tight text-fg tabular-nums">
                    {sub.prixAn !== null ? formatCurrency(sub.prixAn, locale) : '—'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <Stat icon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />} label={t('monEspace.startDate')} value={startDateStr ?? '—'} />
                <Stat icon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />} label={t('monEspace.zones')} value={`1 – ${sub.zones}`} />
                <Stat icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />} label={t('monEspace.status')} value={t('monEspace.statusValid')} />
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
