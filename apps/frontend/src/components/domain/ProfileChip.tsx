import type { ProfilUsager } from '../../types/domain'

const LABELS: Record<ProfilUsager, string> = {
  salarie: 'Salarie',
  etudiant: 'Etudiant',
  scolaire_junior: 'Junior',
  scolaire: 'Scolaire',
  senior: 'Senior',
  tst: 'Aide TST',
  amethyste: 'Amethyste',
}

interface ProfileChipProps {
  profil: ProfilUsager
  active?: boolean
  onSelect?: (profil: ProfilUsager) => void
}

export function ProfileChip({ profil, active = false, onSelect }: ProfileChipProps) {
  return (
    <button
      className={`profile-chip ${active ? 'profile-chip--active' : ''}`}
      type="button"
      aria-pressed={active}
      onClick={() => onSelect?.(profil)}
    >
      {LABELS[profil]}
    </button>
  )
}
