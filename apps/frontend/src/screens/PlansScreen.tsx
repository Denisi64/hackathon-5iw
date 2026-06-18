import { ArrowRight, Search, Ticket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { useLocale } from '../hooks/useLocale'
import { formatCurrency } from '../lib/formatters'
import type { UserProfile } from '../types/domain'
import { PLANS } from '../utils/faresData'
import {
  getPlanDescription,
  getPlanName,
  getPlanPriceLabel,
  getPlanYearlyLabel,
  getProfileLabel,
} from '../utils/planDisplay'

const FILTERS: Array<{ value: 'all' | UserProfile; labelKey: string }> = [
  { value: 'all', labelKey: 'plans.list.filters.all' },
  { value: 'employee', labelKey: 'plans.list.filters.employee' },
  { value: 'student', labelKey: 'plans.list.filters.student' },
  { value: 'school', labelKey: 'plans.list.filters.school' },
  { value: 'senior', labelKey: 'plans.list.filters.senior' },
  { value: 'solidarity', labelKey: 'plans.list.filters.solidarity' },
  { value: 'amethyst', labelKey: 'plans.list.filters.amethyst' },
]

export default function PlansScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locale } = useLocale()
  const [filter, setFilter] = useState<'all' | UserProfile>('all')

  const plans = useMemo(() => {
    if (filter === 'all') return PLANS
    return PLANS.filter((plan) => plan.profiles.includes(filter))
  }, [filter])

  return (
    <div className="flex flex-col gap-10 pb-10">
      <header className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
        <div className="flex flex-col items-start gap-3">
          <Badge variant="info" icon={<Ticket className="h-3 w-3" aria-hidden="true" />}>
            {t('plans.list.kicker')}
          </Badge>
          <h1 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-fg">
            {t('plans.list.title')}
          </h1>
          <p className="max-w-2xl text-fg-muted">
            {t('plans.list.subtitle')}
          </p>
        </div>

        <Card variant="glass" className="p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-fg">{t('plans.list.recommendationTitle')}</p>
              <p className="mt-1 text-sm text-fg-muted">
                {t('plans.list.recommendationBody')}
              </p>
              <Button className="mt-4" size="sm" variant="secondary" onClick={() => navigate('/simulateur')}>
                {t('plans.list.openSimulator')}
              </Button>
            </div>
          </div>
        </Card>
      </header>

      <section aria-label={t('plans.list.filterAria')} className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Chip key={item.value} active={filter === item.value} onClick={() => setFilter(item.value)}>
            {t(item.labelKey)}
          </Chip>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label={t('plans.list.resultsAria')}>
        {plans.map((plan) => (
          <Card key={plan.id} hover spotlight className="p-0">
            <div className="relative h-36 overflow-hidden bg-gradient-to-br from-accent/12 via-surface to-bg-elevated">
              {plan.image ? (
                <img src={plan.image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              ) : (
                <div className="grid h-full place-items-center text-accent">
                  <Ticket className="h-16 w-16" aria-hidden="true" />
                </div>
              )}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge variant="info">{t(`plans.type.${plan.type}`)}</Badge>
                {plan.employerRefund && <Badge variant="success">{t('plans.employerBadge')}</Badge>}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-fg">{getPlanName(plan, t)}</h2>
                  <p className="mt-2 text-sm text-fg-muted">{getPlanDescription(plan, t)}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-2xl font-semibold tracking-tight text-fg">
                  {getPlanPriceLabel(plan, locale, t)}
                </p>
                <p className="mt-1 text-sm text-fg-muted">{getPlanYearlyLabel(plan, locale, t)}</p>
                {plan.yearlyPrice !== null && plan.yearlyPrice > 0 && plan.monthlyPrice !== null && (
                  <p className="mt-1 text-xs text-fg-subtle">
                    {t('plans.list.yearlyEquivalent', { amount: formatCurrency(plan.yearlyPrice, locale) })}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {plan.profiles.slice(0, 3).map((profile) => (
                  <Badge key={profile} variant="neutral">
                    {getProfileLabel(profile, t)}
                  </Badge>
                ))}
              </div>

              <Button
                className="mt-6"
                fullWidth
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                onClick={() => navigate(`/forfaits/${plan.id}`)}
              >
                {t('plans.list.viewDetail')}
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}
