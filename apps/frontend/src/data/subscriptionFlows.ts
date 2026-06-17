import type { ComponentType, SVGProps } from 'react'
import { GraduationCap, Briefcase, Leaf, Search, Users, BookOpen, Accessibility } from 'lucide-react'

export type ProfileSlug = 'student' | 'worker' | 'senior' | 'jobseeker' | 'parent' | 'scholar' | 'amethyste'

export interface ProfileDef {
  slug: ProfileSlug
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Color signature — matches Orb colors. */
  color: 'primary' | 'purple' | 'amber' | 'green' | 'pink'
  /** ID of the default recommended forfait from tarifsData. */
  recommendedForfaitId: string
  /** Document keys shown in the upload step. */
  documents: string[]
  /** Subset of documents that are optional (upload not required to proceed). */
  optionalDocuments?: string[]
}

export const PROFILES: ProfileDef[] = [
  { slug: 'student',   icon: GraduationCap, color: 'purple',  recommendedForfaitId: 'imagine_r_etudiant', documents: ['certificat_scolarite', 'attestation_bourse'] },
  { slug: 'worker',    icon: Briefcase,     color: 'primary', recommendedForfaitId: 'navigo_mois',        documents: ['contrat_travail'], optionalDocuments: ['contrat_travail'] },
  { slug: 'senior',    icon: Leaf,          color: 'green',   recommendedForfaitId: 'navigo_senior',      documents: ['piece_identite'] },
  { slug: 'jobseeker', icon: Search,        color: 'pink',    recommendedForfaitId: 'navigo_solidarite_75', documents: ['france_connect'] },
  { slug: 'parent',    icon: Users,         color: 'amber',   recommendedForfaitId: 'imagine_r_scolaire', documents: ['livret_famille'] },
  { slug: 'scholar',   icon: BookOpen,      color: 'primary', recommendedForfaitId: 'imagine_r_scolaire', documents: ['certificat_scolarite'] },
  { slug: 'amethyste', icon: Accessibility, color: 'purple',  recommendedForfaitId: 'amethyste',          documents: ['carte_invalidite', 'notification_mdph'] },
]

export const PROFILE_BY_SLUG: Record<ProfileSlug, ProfileDef> =
  Object.fromEntries(PROFILES.map((p) => [p.slug, p])) as Record<ProfileSlug, ProfileDef>
