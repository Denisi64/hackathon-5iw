import type { UserProfile } from '../../types/domain'

const LABELS: Record<UserProfile, string> = {
  employee: 'Salarie',
  student: 'Etudiant',
  junior_school: 'Junior',
  school: 'Scolaire',
  senior: 'Senior',
  solidarity: 'Aide TST',
  amethyst: 'Amethyste',
}

interface ProfileChipProps {
  profile: UserProfile
  active?: boolean
  onSelect?: (profile: UserProfile) => void
}

export function ProfileChip({ profile, active = false, onSelect }: ProfileChipProps) {
  return (
    <button
      className={`profile-chip ${active ? 'profile-chip--active' : ''}`}
      type="button"
      aria-pressed={active}
      onClick={() => onSelect?.(profile)}
    >
      {LABELS[profile]}
    </button>
  )
}
