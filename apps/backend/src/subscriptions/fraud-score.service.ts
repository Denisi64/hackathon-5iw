import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { documents, subscriptions, users } from '../db/schema'

export interface FraudSignal {
  name: string
  weight: number
  triggered: boolean
  detail?: string
}

export function computeFraudScore(signals: FraudSignal[]): number {
  const maxScore = signals.reduce((acc, s) => acc + s.weight * 100, 0)
  const actualScore = signals.filter((s) => s.triggered).reduce((acc, s) => acc + s.weight * 100, 0)
  return maxScore === 0 ? 0 : Math.round((actualScore / maxScore) * 100)
}

export function getFraudLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 30) return 'low'
  if (score < 65) return 'medium'
  return 'high'
}

const STUDENT_OFFERS = ['imagine_r_etudiant', 'imagine_r_scolaire', 'imagine_r_junior']
const SENIOR_OFFERS = ['navigo_senior']
const TST_OFFERS = ['tst_50', 'tst_75', 'tst_gratuite']

function isProfileMismatch(profile: string | null, offerId: string): boolean {
  if (!profile) return false
  if (STUDENT_OFFERS.includes(offerId) && !['student', 'school', 'junior_school'].includes(profile)) return true
  if (SENIOR_OFFERS.includes(offerId) && profile !== 'senior') return true
  if (TST_OFFERS.includes(offerId) && profile !== 'tst') return true
  return false
}

function extractLastName(aiExtractedData: string | null): string | null {
  if (!aiExtractedData) return null
  try {
    const parsed = JSON.parse(aiExtractedData) as Record<string, unknown>
    return (parsed.nom_famille as string) ?? (parsed.lastName as string) ?? null
  } catch {
    return null
  }
}

@Injectable()
export class FraudScoreService {
  async compute(subscriptionId: string): Promise<void> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1)
    if (!sub) return

    const [user] = await db.select().from(users).where(eq(users.id, sub.payerId)).limit(1)
    const docs = await db.select().from(documents).where(eq(documents.subscriptionId, subscriptionId))

    const docWithName = docs.find((d) => d.aiExtractedData !== null)
    const docLastName = docWithName ? extractLastName(docWithName.aiExtractedData) : null
    const userLastName = user?.lastName?.toLowerCase() ?? null
    const nameInconsistent =
      docLastName !== null && userLastName !== null && docLastName.toLowerCase() !== userLastName

    const now = Date.now()
    const hasExpiredDoc = docs.some((d) => d.expiresAt !== null && d.expiresAt.getTime() < now)

    const signals: FraudSignal[] = [
      {
        name: 'ai_document_inconsistency',
        weight: 3,
        triggered: nameInconsistent,
      },
      {
        name: 'document_expired',
        weight: 3,
        triggered: hasExpiredDoc,
      },
      {
        name: 'fast_form_fill',
        weight: 2,
        triggered: false,
      },
      {
        name: 'profile_mismatch',
        weight: 2,
        triggered: isProfileMismatch(user?.profile ?? null, sub.offerId),
      },
      {
        name: 'low_ocr_confidence',
        weight: 3,
        triggered: docs.some((d) => d.aiConfidence !== null && (d.aiConfidence ?? 100) < 50),
      },
      {
        name: 'public_api_rights_unverified',
        weight: 3,
        triggered: false,
      },
    ]

    const score = computeFraudScore(signals)
    const level = getFraudLevel(score)

    await db
      .update(subscriptions)
      .set({ fraudScore: score, fraudLevel: level, fraudSignals: signals, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
  }
}
