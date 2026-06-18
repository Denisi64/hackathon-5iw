import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, CheckCircle2, CreditCard, MapPin, QrCode, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { NavigoCard } from '../components/domain/NavigoCard'
import { useAuthStore } from '../stores/authStore'
import { useLocale } from '../hooks/useLocale'

export default function NavigoScreen() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const sub = user?.subscription ?? null

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-xs tracking-widest uppercase text-fg-muted">{t('navigo.title')}</span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">{t('navigo.title')}</h1>
        <p className="text-fg-muted">{t('navigo.subtitle')}</p>
      </header>

      {!sub || sub.status !== 'active' ? (
        <Card spotlight>
          <Card.Body>
            <div className="flex flex-col items-start gap-4 py-2">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
                <CreditCard className="h-8 w-8" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-fg">{t('navigo.empty.title')}</h2>
              <p className="max-w-md text-fg-muted">{t('navigo.empty.body')}</p>
              <Button size="md" onClick={() => navigate('/souscrire')}>{t('navigo.empty.cta')}</Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start">
          <div className="flex flex-col gap-4">
            {user && (
              <NavigoCard offerName={sub.offerName ?? sub.offerId} firstName={user.firstName} lastName={user.lastName} endDate={sub.endDate} locale={locale} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fmt(sub.startDate) && (
                <Stat icon={<Calendar className="h-4 w-4" aria-hidden="true" />} label={t('navigo.validSince')} value={fmt(sub.startDate)!} />
              )}
              {fmt(sub.endDate) && (
                <Stat icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />} label={t('navigo.expiresOn')} value={fmt(sub.endDate)!} />
              )}
              <Stat icon={<MapPin className="h-4 w-4" aria-hidden="true" />} label={t('navigo.zones')} value={t('navigo.zonesValue')} />
              <Stat
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />}
                label={t('navigo.status')}
                value={t('navigo.statusActive')}
              />
            </div>
          </div>

          {/* QR de validation (mock) */}
          <Card>
            <Card.Body>
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="grid h-40 w-40 place-items-center rounded-2xl border-2 border-border-default bg-surface text-fg-subtle">
                  <QrCode className="h-24 w-24" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-fg">{t('navigo.qr.title')}</p>
                <p className="text-xs text-fg-muted">{t('navigo.qr.subtitle')}</p>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface border border-border-default p-3">
      <div className="flex items-center gap-1.5 text-fg-muted">
        {icon}
        <span className="font-mono text-[10px] tracking-widest uppercase">{label}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-fg">{value}</p>
    </div>
  )
}
