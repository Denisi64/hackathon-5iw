import { useTranslation } from 'react-i18next'
import type { Forfait } from '../../types/domain'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../lib/formatters'
import { useLocale } from '../../hooks/useLocale'

export interface ForfaitCardProps {
  forfait: Forfait
  prixAn: number
  economie: number
  isRecommended?: boolean
  onSelect?: () => void
}

export function ForfaitCard({ forfait, prixAn, economie, isRecommended, onSelect }: ForfaitCardProps) {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <Card hover spotlight>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono tracking-widest text-fg-muted uppercase">
            {forfait.renouvellement}
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-fg">{forfait.nom}</h3>
        </div>
        {isRecommended && <Badge variant="recommended">{t('simulator.recommended')}</Badge>}
      </Card.Header>

      <Card.Body>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-fg tabular-nums">
            {prixAn === Infinity ? '—' : formatCurrency(prixAn, locale)}
          </span>
          <span className="text-sm text-fg-muted">{t('simulator.perYear')}</span>
        </div>
        {forfait.prixMois !== null && (
          <p className="mt-1 text-sm text-fg-muted tabular-nums">
            {formatCurrency(forfait.prixMois, locale)}{t('simulator.perMonth')}
          </p>
        )}
        {economie > 0 && (
          <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {t('simulator.savingVsTickets', { amount: formatCurrency(economie, locale) })}
          </p>
        )}
        {forfait.remboursementEmployeur && (
          <p className="mt-3 text-xs text-fg-muted">{t('simulator.tipEmployer')}</p>
        )}
      </Card.Body>

      <Card.Footer>
        <Button variant={isRecommended ? 'primary' : 'secondary'} size="md" onClick={onSelect} fullWidth>
          {t('simulator.subscribe')}
        </Button>
      </Card.Footer>
    </Card>
  )
}
