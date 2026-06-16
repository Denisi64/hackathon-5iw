export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export type SubscriptionStatus =
  | 'draft'
  | 'pending_documents'
  | 'pending_payment'
  | 'active'
  | 'suspended'
  | 'cancelled'
  | 'expired'

export type FraudLevel = 'low' | 'medium' | 'high'

export type DocumentStatus = 'uploaded' | 'validating' | 'valid' | 'rejected'
