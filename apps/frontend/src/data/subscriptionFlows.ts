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
  /** Document keys required (used to look up i18n labels). */
  documents: string[]
}

export const PROFILES: ProfileDef[] = [
  { slug: 'student',   icon: GraduationCap, color: 'purple',  recommendedForfaitId: 'imagine_r_etudiant', documents: ['certificat_scolarite', 'attestation_bourse'] },
  { slug: 'worker',    icon: Briefcase,     color: 'primary', recommendedForfaitId: 'navigo_mois',        documents: ['contrat_travail'] },
  { slug: 'senior',    icon: Leaf,          color: 'green',   recommendedForfaitId: 'navigo_senior',      documents: ['piece_identite'] },
  { slug: 'jobseeker', icon: Search,        color: 'pink',    recommendedForfaitId: 'navigo_solidarite_75', documents: ['france_connect'] },
  { slug: 'parent',    icon: Users,         color: 'amber',   recommendedForfaitId: 'imagine_r_scolaire', documents: ['livret_famille'] },
  { slug: 'scholar',   icon: BookOpen,      color: 'primary', recommendedForfaitId: 'imagine_r_scolaire', documents: ['certificat_scolarite'] },
  { slug: 'amethyste', icon: Accessibility, color: 'purple',  recommendedForfaitId: 'amethyste',          documents: ['carte_invalidite', 'notification_mdph'] },
]

export const PROFILE_BY_SLUG: Record<ProfileSlug, ProfileDef> =
  Object.fromEntries(PROFILES.map((p) => [p.slug, p])) as Record<ProfileSlug, ProfileDef>

/**
 * Fournisseur de vérification à la source pour un justificatif donné.
 * Les clés absentes de ce mapping restent en upload classique.
 */
export type VerificationProvider = 'caf' | 'scholarship' | 'identity'

export const DOC_VERIFICATION: Record<string, VerificationProvider> = {
  france_connect: 'caf', // droits TST via la CAF
  attestation_bourse: 'scholarship', // statut boursier via le CROUS
  piece_identite: 'identity', // identité + âge via FranceConnect
}

/**
 * Forfait → profil de souscription le plus pertinent.
 * Permet d'entrer dans le tunnel directement depuis le simulateur avec un
 * forfait choisi, en pré-sélectionnant le profil (justificatifs cohérents).
 */
export const FORFAIT_TO_PROFILE: Record<string, ProfileSlug> = {
  navigo_jour: 'worker',
  navigo_semaine: 'worker',
  navigo_mois: 'worker',
  navigo_annuel: 'worker',
  liberte_plus: 'worker',
  navigo_senior: 'senior',
  imagine_r_etudiant: 'student',
  imagine_r_scolaire: 'scholar',
  imagine_r_junior: 'scholar',
  navigo_solidarite_75: 'jobseeker',
  navigo_reduction_50: 'jobseeker',
  navigo_gratuite: 'jobseeker',
  amethyste: 'amethyste',
}
