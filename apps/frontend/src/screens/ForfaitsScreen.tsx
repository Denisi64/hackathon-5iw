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
import type { ProfilUsager } from '../types/domain'
import { FORFAITS } from '../utils/tarifsData'
import {
  getForfaitDescription,
  getForfaitName,
  getForfaitPriceLabel,
  getForfaitYearlyLabel,
  getProfileLabel,
} from '../utils/forfaitDisplay'

const FILTERS: Array<{ value: 'all' | ProfilUsager; labelKey: string }> = [
  { value: 'all', labelKey: 'forfaits.list.filters.all' },
  { value: 'salarie', labelKey: 'forfaits.list.filters.salarie' },
  { value: 'etudiant', labelKey: 'forfaits.list.filters.etudiant' },
  { value: 'scolaire', labelKey: 'forfaits.list.filters.scolaire' },
  { value: 'senior', labelKey: 'forfaits.list.filters.senior' },
  { value: 'tst', labelKey: 'forfaits.list.filters.tst' },
  { value: 'amethyste', labelKey: 'forfaits.list.filters.amethyste' },
]

export default function ForfaitsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { locale } = useLocale()
  const [filter, setFilter] = useState<'all' | ProfilUsager>('all')

  const forfaits = useMemo(() => {
    if (filter === 'all') return FORFAITS
    return FORFAITS.filter((forfait) => forfait.profils.includes(filter))
  }, [filter])

  return (
    <div className="flex flex-col gap-10 pb-10">
      <header className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
        <div className="flex flex-col items-start gap-3">
          <Badge variant="info" icon={<Ticket className="h-3 w-3" aria-hidden="true" />}>
            {t('forfaits.list.kicker')}
          </Badge>
          <h1 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-fg">
            {t('forfaits.list.title')}
          </h1>
          <p className="max-w-2xl text-fg-muted">
            {t('forfaits.list.subtitle')}
          </p>
        </div>

        <Card variant="glass" className="p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-fg">{t('forfaits.list.recommendationTitle')}</p>
              <p className="mt-1 text-sm text-fg-muted">
                {t('forfaits.list.recommendationBody')}
              </p>
              <Button className="mt-4" size="sm" variant="secondary" onClick={() => navigate('/simulateur')}>
                {t('forfaits.list.openSimulator')}
              </Button>
            </div>
          </div>
        </Card>
      </header>

      <section aria-label={t('forfaits.list.filterAria')} className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Chip key={item.value} active={filter === item.value} onClick={() => setFilter(item.value)}>
            {t(item.labelKey)}
          </Chip>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label={t('forfaits.list.resultsAria')}>
        {forfaits.map((forfait) => (
          <Card key={forfait.id} hover spotlight className="p-0">
            <div className="relative h-36 overflow-hidden bg-gradient-to-br from-accent/12 via-surface to-bg-elevated">
              {forfait.image ? (
                <img src={forfait.image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
              ) : (
                <div className="grid h-full place-items-center text-accent">
                  <Ticket className="h-16 w-16" aria-hidden="true" />
                </div>
              )}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge variant="info">{t(`forfaits.type.${forfait.type}`)}</Badge>
                {forfait.remboursementEmployeur && <Badge variant="success">{t('forfaits.employerBadge')}</Badge>}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-fg">{getForfaitName(forfait, t)}</h2>
                  <p className="mt-2 text-sm text-fg-muted">{getForfaitDescription(forfait, t)}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-2xl font-semibold tracking-tight text-fg">
                  {getForfaitPriceLabel(forfait, locale, t)}
                </p>
                <p className="mt-1 text-sm text-fg-muted">{getForfaitYearlyLabel(forfait, locale, t)}</p>
                {forfait.prixAn !== null && forfait.prixAn > 0 && forfait.prixMois !== null && (
                  <p className="mt-1 text-xs text-fg-subtle">
                    {t('forfaits.list.yearlyEquivalent', { amount: formatCurrency(forfait.prixAn, locale) })}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {forfait.profils.slice(0, 3).map((profile) => (
                  <Badge key={profile} variant="neutral">
                    {getProfileLabel(profile, t)}
                  </Badge>
                ))}
              </div>

              <Button
                className="mt-6"
                fullWidth
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                onClick={() => navigate(`/forfaits/${forfait.id}`)}
              >
                {t('forfaits.list.viewDetail')}
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}
