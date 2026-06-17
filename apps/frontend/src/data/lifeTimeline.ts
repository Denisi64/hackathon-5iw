import type { ComponentType, SVGProps } from 'react'
import { Baby, BookOpen, GraduationCap, KeyRound, Briefcase, Leaf, HandCoins, Accessibility } from 'lucide-react'

export type MilestoneKind = 'forfait' | 'transition'
export type MilestoneColor = 'purple' | 'amber' | 'primary' | 'green' | 'pink'

export interface Milestone {
  /** Clé i18n (timeline.milestones.<id>) et identifiant React. */
  id: string
  kind: MilestoneKind
  /** Forfait associé (pour kind === 'forfait') — id dans tarifsData. */
  forfaitId?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  color: MilestoneColor
}

/** Parcours chronologique principal — de l'enfance à la retraite. */
export const LIFE_MILESTONES: Milestone[] = [
  { id: 'junior',   kind: 'forfait',    forfaitId: 'imagine_r_junior',   icon: Baby,          color: 'purple' },
  { id: 'scolaire', kind: 'forfait',    forfaitId: 'imagine_r_scolaire', icon: BookOpen,      color: 'amber' },
  { id: 'payeur16', kind: 'transition',                                  icon: KeyRound,      color: 'pink' },
  { id: 'etudiant', kind: 'forfait',    forfaitId: 'imagine_r_etudiant', icon: GraduationCap, color: 'purple' },
  { id: 'annuel',   kind: 'forfait',    forfaitId: 'navigo_annuel',      icon: Briefcase,     color: 'primary' },
  { id: 'senior',   kind: 'forfait',    forfaitId: 'navigo_senior',      icon: Leaf,          color: 'green' },
]

/** Forfaits transverses, hors du parcours chronologique classique. */
export const LIFE_ALTERNATIVES: Milestone[] = [
  { id: 'tst',       kind: 'forfait', forfaitId: 'navigo_solidarite_75', icon: HandCoins,    color: 'pink' },
  { id: 'amethyste', kind: 'forfait', forfaitId: 'amethyste',            icon: Accessibility, color: 'green' },
]
