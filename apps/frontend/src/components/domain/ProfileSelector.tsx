import { useTranslation } from 'react-i18next'
import type { UserProfile } from '../../types/domain'
import { Chip } from '../ui/Chip'

const PROFILES: UserProfile[] = [
  'employee', 'student', 'junior_school', 'school', 'senior', 'solidarity', 'amethyst',
]

export interface ProfileSelectorProps {
  value: UserProfile
  onChange: (p: UserProfile) => void
  className?: string
}

export function ProfileSelector({ value, onChange, className }: ProfileSelectorProps) {
  const { t } = useTranslation()
  return (
    <div className={className}>
      <p className="mb-3 text-xs font-medium tracking-wide text-fg-muted uppercase">{t('simulator.yourProfile')}</p>
      <div className="flex flex-wrap gap-2">
        {PROFILES.map((p) => (
          <Chip key={p} active={value === p} onClick={() => onChange(p)}>
            {t(`profiles.${p}`)}
          </Chip>
        ))}
      </div>
    </div>
  )
}
