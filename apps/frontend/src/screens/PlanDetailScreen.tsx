import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  WalletCards,
} from 'lucide-react'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useLocale } from '../hooks/useLocale'
import { PLANS } from '../utils/faresData'
import {
  getDocumentLabels,
  getPlanDescription,
  getPlanBenefits,
  getPlanName,
  getPlanPriceLabel,
  getPlanYearlyLabel,
  getProfileLabel,
  getRenewalLabel,
} from '../utils/planDisplay'

export default function PlanDetailScreen() {
  const { t } = useTranslation()
  const { planId } = useParams()
  const navigate = useNavigate()
  const { locale } = useLocale()

  const plan = useMemo(() => PLANS.find((item) => item.id === planId), [planId])
  const relatedPlans = useMemo(() => {
    if (!plan) return []
    return PLANS.filter((item) => item.id !== plan.id && item.profiles.some((profile) => plan.profiles.includes(profile)))
      .slice(0, 3)
  }, [plan])

  if (!plan) {
    return (
      <div className="mx-auto max-w-2xl pb-16">
        <Card className="text-center">
          <Card.Body>
            <Badge variant="warning">{t('plans.detail.notFoundBadge')}</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg">{t('plans.detail.notFoundTitle')}</h1>
            <p className="mt-3 text-fg-muted">
              {t('plans.detail.notFoundBody')}
            </p>
            <Button className="mt-6" onClick={() => navigate('/forfaits')}>
              {t('plans.detail.viewAll')}
            </Button>
          </Card.Body>
        </Card>
      </div>
    )
  }

  const documents = getDocumentLabels(plan, t)
  const benefits = getPlanBenefits(plan, t)

  return (
    <div className="flex flex-col gap-8 pb-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex w-fit items-center gap-2 rounded-lg text-sm font-medium text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('common.back')}
      </button>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <Card variant="feature" spotlight className="min-h-[520px]">
          <div className="grid h-full gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
            <div className="flex flex-col items-start">
              <div className="flex flex-wrap gap-2">
                <Badge variant="recommended" icon={<Sparkles className="h-3 w-3" aria-hidden="true" />}>
                  {t('plans.detail.badge')}
                </Badge>
                <Badge variant="info">{t(`plans.type.${plan.type}`)}</Badge>
                {plan.employerRefund && <Badge variant="success">{t('plans.detail.employerRefundBadge')}</Badge>}
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
                {getPlanName(plan, t)}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-fg-muted">{getPlanDescription(plan, t)}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Metric icon={<WalletCards className="h-4 w-4" aria-hidden="true" />} label={t('plans.detail.metric.price')} value={getPlanPriceLabel(plan, locale, t)} />
                <Metric icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />} label={t('plans.detail.metric.rhythm')} value={getRenewalLabel(plan.renewal, t)} />
                <Metric icon={<Ticket className="h-4 w-4" aria-hidden="true" />} label={t('plans.detail.metric.zones')} value={t('plans.display.benefits.zones', { min: plan.zones.min, max: plan.zones.max })} />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  onClick={() => navigate(`/souscrire?plan=${plan.id}`)}
                >
                  {t('plans.detail.subscribe')}
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/simulateur')}>
                  {t('plans.detail.resimulate')}
                </Button>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border-default bg-gradient-to-br from-accent/14 via-surface to-bg-elevated">
              {plan.image ? (
                <img src={plan.image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              ) : (
                <div className="grid h-full place-items-center text-accent">
                  <Ticket className="h-28 w-28" aria-hidden="true" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-elevated via-bg-elevated/80 to-transparent p-5 pt-16">
                <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">{t('plans.detail.indicativePrice')}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-fg">{getPlanYearlyLabel(plan, locale, t)}</p>
              </div>
            </div>
          </div>
        </Card>

        <aside className="grid gap-4">
          <Card>
            <Card.Header>
              <div>
                <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">{t('plans.detail.forWhom')}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-fg">{t('plans.detail.eligibleProfiles')}</h2>
              </div>
              <Users className="h-5 w-5 text-accent" aria-hidden="true" />
            </Card.Header>
            <Card.Body>
              <div className="flex flex-wrap gap-2">
                {plan.profiles.map((profile) => (
                  <Badge key={profile} variant="neutral">
                    {getProfileLabel(profile, t)}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div>
                <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">{t('plans.detail.documentsKicker')}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-fg">{t('plans.detail.documentsTitle')}</h2>
              </div>
              <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
            </Card.Header>
            <Card.Body>
              {documents.length === 0 ? (
                <p className="text-sm text-fg-muted">{t('plans.detail.noDocuments')}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {documents.map((document) => (
                    <li key={document} className="flex items-center gap-2 text-sm text-fg-muted">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                      {document}
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div>
                <p className="font-mono text-xs tracking-widest text-fg-muted uppercase">{t('plans.detail.sourceKicker')}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-fg">{t('plans.detail.officialFare')}</h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
            </Card.Header>
            <Card.Body>
              <a
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-bright"
                href={plan.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t('plans.detail.sourceLink')}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </Card.Body>
          </Card>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label={t('plans.detail.benefitsAria')}>
        {benefits.map((benefit) => (
          <Card key={benefit} className="p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-fg">{benefit}</p>
            </div>
          </Card>
        ))}
      </section>

      {relatedPlans.length > 0 && (
        <section className="flex flex-col gap-4" aria-label={t('plans.detail.relatedAria')}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <Badge variant="neutral">{t('plans.detail.alternatives')}</Badge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg">{t('plans.detail.relatedTitle')}</h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/forfaits')}>
              {t('plans.detail.viewAllShort')}
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPlans.map((item) => (
              <Card key={item.id} hover className="p-5">
                <Card.Body>
                  <h3 className="text-lg font-semibold tracking-tight text-fg">{getPlanName(item, t)}</h3>
                  <p className="mt-2 min-h-12 text-sm text-fg-muted">{getPlanDescription(item, t)}</p>
                  <p className="mt-4 text-xl font-semibold tracking-tight text-fg">{getPlanPriceLabel(item, locale, t)}</p>
                </Card.Body>
                <Card.Footer>
                  <Button fullWidth variant="secondary" onClick={() => navigate(`/forfaits/${item.id}`)}>
                    {t('plans.list.viewDetail')}
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface p-4 shadow-inner">
      <div className="flex items-center gap-2 text-accent">
        {icon}
        <span className="font-mono text-[10px] tracking-widest uppercase">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-fg">{value}</p>
    </div>
  )
}
