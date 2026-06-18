import { useTranslation } from 'react-i18next'
import type { Plan } from '../../types/domain'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../lib/formatters'
import { useLocale } from '../../hooks/useLocale'
import { getPlanName } from '../../utils/planDisplay'

export interface PlanCardProps {
  plan: Plan
  yearlyPrice: number
  savings: number
  isRecommended?: boolean
  onSelect?: () => void
}

export function PlanCard({ plan, yearlyPrice, savings, isRecommended, onSelect }: PlanCardProps) {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <Card hover spotlight>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono tracking-widest text-fg-muted uppercase">
            {plan.renewal}
          </span>
          <h3 className="text-lg font-semibold tracking-tight text-fg">{getPlanName(plan, t)}</h3>
        </div>
        {isRecommended && <Badge variant="recommended">{t('simulator.recommended')}</Badge>}
      </Card.Header>

      <Card.Body>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-fg tabular-nums">
            {yearlyPrice === Infinity ? '—' : formatCurrency(yearlyPrice, locale)}
          </span>
          <span className="text-sm text-fg-muted">{t('simulator.perYear')}</span>
        </div>
        {plan.monthlyPrice !== null && (
          <p className="mt-1 text-sm text-fg-muted tabular-nums">
            {formatCurrency(plan.monthlyPrice, locale)}{t('simulator.perMonth')}
          </p>
        )}
        {savings > 0 && (
          <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {t('simulator.savingVsTickets', { amount: formatCurrency(savings, locale) })}
          </p>
        )}
        {plan.employerRefund && (
          <p className="mt-3 text-xs text-fg-muted">{t('simulator.tipEmployer')}</p>
        )}
      </Card.Body>

      <Card.Footer>
        <Button variant={isRecommended ? 'primary' : 'secondary'} size="md" onClick={onSelect} fullWidth>
          {t('plans.list.viewDetail')}
        </Button>
      </Card.Footer>
    </Card>
  )
}
