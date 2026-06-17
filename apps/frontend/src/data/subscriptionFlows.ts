import type { ComponentType, SVGProps } from 'react'
import { GraduationCap, Briefcase, Leaf, Search, Users, BookOpen, Accessibility } from 'lucide-react'

export type ProfileSlug = 'student' | 'worker' | 'senior' | 'jobseeker' | 'parent' | 'scholar' | 'amethyst'

export interface ProfileDef {
  slug: ProfileSlug
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Color signature — matches Orb colors. */
  color: 'primary' | 'purple' | 'amber' | 'green' | 'pink'
  /** ID of the default recommended plan from faresData. */
  recommendedPlanId: string
  /** Document keys required (used to look up i18n labels). */
  documents: string[]
}

export const PROFILES: ProfileDef[] = [
  { slug: 'student',   icon: GraduationCap, color: 'purple',  recommendedPlanId: 'imagine_r_student', documents: ['school_certificate', 'scholarship_certificate'] },
  { slug: 'worker',    icon: Briefcase,     color: 'primary', recommendedPlanId: 'navigo_month',        documents: ['employment_contract'] },
  { slug: 'senior',    icon: Leaf,          color: 'green',   recommendedPlanId: 'navigo_senior',      documents: ['identity_document'] },
  { slug: 'jobseeker', icon: Search,        color: 'pink',    recommendedPlanId: 'navigo_solidarity_75', documents: ['france_connect'] },
  { slug: 'parent',    icon: Users,         color: 'amber',   recommendedPlanId: 'imagine_r_school', documents: ['family_record_book'] },
  { slug: 'scholar',   icon: BookOpen,      color: 'primary', recommendedPlanId: 'imagine_r_school', documents: ['school_certificate'] },
  { slug: 'amethyst', icon: Accessibility, color: 'purple',  recommendedPlanId: 'amethyst',          documents: ['disability_card', 'mdph_notice'] },
]

export const PROFILE_BY_SLUG: Record<ProfileSlug, ProfileDef> =
  Object.fromEntries(PROFILES.map((p) => [p.slug, p])) as Record<ProfileSlug, ProfileDef>
