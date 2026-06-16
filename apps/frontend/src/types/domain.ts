export type UserProfile =
  | 'employee'
  | 'student'
  | 'junior_school'
  | 'school'
  | 'senior'
  | 'solidarity'
  | 'amethyst'

export type ZoneLevel = 1 | 2 | 3 | 4 | 5

export type RenewalFrequency = 'annual' | 'monthly' | 'quarterly' | 'weekly' | 'pay_as_you_go'

export interface SimulatorParams {
  profile: UserProfile
  weeklyUsageDays: number
  tripsPerDay: number
  zones: ZoneLevel
  age?: number
  scholarshipHolder?: boolean
}

export interface Offer {
  id: string
  name: string
  description: string
  profiles: UserProfile[]
  yearlyPrice: number | null
  monthlyPrice: number | null
  zones: { min: ZoneLevel; max: ZoneLevel }
  renewalFrequency: RenewalFrequency
  requiredDocuments: string[]
  condition?: (params: SimulatorParams) => boolean
  employerRefundRate?: number
}

export interface PriceResult {
  offer: Offer
  yearlyPrice: number
  savingsVsTickets: number
  eligible: boolean
  recommended: boolean
  advice: string
}

export interface SubscriptionDraft {
  profile: UserProfile
  offerId: string
  currentStep: number
  hasDifferentPayer: boolean
  usesAutomaticVerification: boolean
}
