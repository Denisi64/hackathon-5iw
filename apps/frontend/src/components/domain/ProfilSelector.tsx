import { useTranslation } from 'react-i18next'
import type { ProfilUsager } from '../../types/domain'
import { Chip } from '../ui/Chip'

const PROFILS: ProfilUsager[] = [
  'salarie', 'etudiant', 'scolaire_junior', 'scolaire', 'senior', 'tst', 'amethyste',
]

export interface ProfilSelectorProps {
  value: ProfilUsager
  onChange: (p: ProfilUsager) => void
  className?: string
}

export function ProfilSelector({ value, onChange, className }: ProfilSelectorProps) {
  const { t } = useTranslation()
  return (
    <div className={className}>
      <p className="mb-3 text-xs font-medium tracking-wide text-fg-muted uppercase">{t('simulator.yourProfile')}</p>
      <div className="flex flex-wrap gap-2">
        {PROFILS.map((p) => (
          <Chip key={p} active={value === p} onClick={() => onChange(p)}>
            {t(`profiles.${p}`)}
          </Chip>
        ))}
      </div>
    </div>
  )
}
