import type { UserProfile } from '../types/domain'
import type { FraudSignal } from './fraud-score.service'

export interface FraudSignalsInput {
  subscriptionCreatedAt: Date
  subscriptionUpdatedAt: Date
  offerProfiles: UserProfile[]
  payerProfile: UserProfile | null
  documents: Array<{
    aiConfidence: number | null
    aiIssues: unknown
    expiresAt: Date | null
  }>
}

export function buildFraudSignals(input: FraudSignalsInput): FraudSignal[] {
  const hasIssues = input.documents.some((doc) => Array.isArray(doc.aiIssues) && doc.aiIssues.length > 0)
  const hasExpired = input.documents.some((doc) => doc.expiresAt !== null && doc.expiresAt < new Date())
  const filledInUnder30s =
    input.subscriptionUpdatedAt.getTime() - input.subscriptionCreatedAt.getTime() < 30_000
  const profileMismatch =
    input.payerProfile !== null && !input.offerProfiles.includes(input.payerProfile)
  const lowOcrConfidence = input.documents.some(
    (doc) => doc.aiConfidence !== null && doc.aiConfidence < 50,
  )

  return [
    {
      name: 'ai_document_inconsistency',
      weight: 3,
      triggered: hasIssues,
      detail: 'Inconsistencies detected by Claude vision',
    },
    {
      name: 'document_expired',
      weight: 3,
      triggered: hasExpired,
      detail: 'A document is expired',
    },
    {
      name: 'fast_form_fill',
      weight: 2,
      triggered: filledInUnder30s,
      detail: 'Form submitted in under 30 seconds',
    },
    {
      name: 'profile_mismatch',
      weight: 2,
      triggered: profileMismatch,
      detail: 'Payer profile does not match the selected offer',
    },
    {
      name: 'low_ocr_confidence',
      weight: 3,
      triggered: lowOcrConfidence,
      detail: 'OCR confidence score below 50',
    },
    {
      name: 'public_api_rights_unverified',
      weight: 3,
      triggered: false,
      detail: 'Public API verification not implemented (Feature 6 out of scope)',
    },
  ]
}
