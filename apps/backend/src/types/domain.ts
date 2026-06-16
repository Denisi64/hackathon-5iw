export type ProfilUsager =
  | 'salarie'
  | 'etudiant'
  | 'scolaire_junior'
  | 'scolaire'
  | 'senior'
  | 'tst'
  | 'amethyste'

export type NiveauZone = 1 | 2 | 3 | 4 | 5

export type Renouvellement = 'annuel' | 'mensuel' | 'trimestriel' | 'hebdomadaire' | 'usage'

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
