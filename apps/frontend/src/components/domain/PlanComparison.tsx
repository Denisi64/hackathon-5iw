import { useTranslation } from 'react-i18next'
import { PlanCard } from './PlanCard'
import type { SimulatorResult } from '../../hooks/useSimulator'

export interface PlanComparisonProps {
  results: SimulatorResult[]
  onSelect?: (planId: string) => void
}

export function PlanComparison({ results, onSelect }: PlanComparisonProps) {
  const { t } = useTranslation()

  if (results.length === 0) {
    return (
      <p className="rounded-2xl bg-bg-elevated p-8 text-center text-fg-muted border border-border-default shadow-card">
        {t('simulator.empty')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {results.map((r, i) => (
        <PlanCard
          key={r.plan.id}
          plan={r.plan}
          yearlyPrice={r.yearlyPrice}
          savings={r.savings}
          isRecommended={i === 0}
          onSelect={() => onSelect?.(r.plan.id)}
        />
      ))}
    </div>
  )
}
