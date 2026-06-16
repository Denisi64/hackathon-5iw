export type UserProfile =
  | 'employee'
  | 'student'
  | 'junior_school'
  | 'school'
  | 'senior'
  | 'tst'
  | 'amethyste'

export type ZoneLevel = 1 | 2 | 3 | 4 | 5

export type Renewal = 'annual' | 'monthly' | 'quarterly' | 'weekly' | 'usage'

export type SubscriptionStatus =
  | 'draft'
  | 'pending_documents'
  | 'pending_payment'
  | 'active'
  | 'suspended'
  | 'cancelled'
  | 'expired'

export type DocumentStatus = 'uploaded' | 'validating' | 'valid' | 'rejected'

export type FraudLevel = 'low' | 'medium' | 'high'

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat?: number
  exp?: number
}
