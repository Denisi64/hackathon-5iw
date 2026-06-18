export type UserProfile =
  | 'employee'
  | 'student'
  | 'junior_school'
  | 'school'
  | 'senior'
  | 'solidarity'
  | 'amethyst'

export type ZoneLevel = 1 | 2 | 3 | 4 | 5

export type PlanType = 'day' | 'weekly' | 'monthly' | 'yearly' | 'usage'

export interface ProfileFlags {
  /** Enrolled as a higher-education student. */
  isStudent?: boolean
  /** Apprentice or work-study student covered by Imagine R School. */
  isApprentice?: boolean
  /** Employee status, enabling the 50% employer refund hint. */
  isEmployee?: boolean
  /** Retired status, independent from declared age. */
  isRetired?: boolean
  /** RSA beneficiary, subject to conditions. */
  hasRSA?: boolean
  /** CSS beneficiary without financial copay. */
  hasCssWithoutCopay?: boolean
  /** ASS beneficiary. */
  hasASS?: boolean
  /** AME beneficiary. */
  hasAME?: boolean
}

export interface SimulatorParams {
  profile: UserProfile
  daysPerWeek: number
  tripsPerDay: number
  zones: ZoneLevel
  age?: number
  scholarship?: boolean
  flags?: ProfileFlags
}

export interface Plan {
  id: string
  name: string
  /** Commitment and billing cadence. */
  type: PlanType
  /** Short fallback description shown on the plan card. */
  description: string
  /** Official-looking visual when available, otherwise null for the gradient fallback. */
  image: string | null
  /** Sort priority, lower values appear first. */
  priority: number
  /** Official source URL. */
  sourceUrl: string
  profiles: UserProfile[]
  yearlyPrice: number | null
  monthlyPrice: number | null
  zones: { min: ZoneLevel; max: ZoneLevel }
  renewal: 'yearly' | 'monthly' | 'quarterly' | 'weekly' | 'usage' | 'day'
  requiredDocuments: string[]
  /** Basic simulator predicate for usage frequency and age. */
  condition?: (p: SimulatorParams) => boolean
  /** Rich eligibility predicate based on flags, age, and profile. */
  eligible?: (p: SimulatorParams) => boolean
  employerRefund?: number
}
