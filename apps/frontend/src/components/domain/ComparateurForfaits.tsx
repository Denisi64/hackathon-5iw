import { useTranslation } from 'react-i18next'
import { ForfaitCard } from './ForfaitCard'
import type { SimulatorResult } from '../../hooks/useSimulator'

export interface ComparateurForfaitsProps {
  results: SimulatorResult[]
  onSelect?: (forfaitId: string) => void
}

export function ComparateurForfaits({ results, onSelect }: ComparateurForfaitsProps) {
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
        <ForfaitCard
          key={r.forfait.id}
          forfait={r.forfait}
          prixAn={r.prixAn}
          economie={r.economie}
          isRecommended={i === 0}
          onSelect={() => onSelect?.(r.forfait.id)}
        />
      ))}
    </div>
  )
}
