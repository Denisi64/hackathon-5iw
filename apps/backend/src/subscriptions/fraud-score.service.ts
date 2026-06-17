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
  const actualScore = signals.filter(s => s.triggered).reduce((acc, s) => acc + s.weight * 100, 0)
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

function isProfileOfferMismatch(profil: string | null, offerId: string): boolean {
  if (!profil) return false
  if (STUDENT_OFFERS.includes(offerId) && !['etudiant', 'scolaire', 'scolaire_junior'].includes(profil)) return true
  if (SENIOR_OFFERS.includes(offerId) && profil !== 'senior') return true
  if (TST_OFFERS.includes(offerId) && profil !== 'tst') return true
  return false
}

@Injectable()
export class FraudScoreService {
  async compute(subscriptionId: string) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1)
    if (!sub) return null

    const [user] = sub.payeurId
      ? await db.select().from(users).where(eq(users.id, sub.payeurId)).limit(1)
      : [null]
    const docs = await db.select().from(documents).where(eq(documents.subscriptionId, subscriptionId))

    const signals: FraudSignal[] = [
      {
        name: 'low_ocr_confidence',
        weight: 3,
        triggered: docs.some(d => d.aiConfidence !== null && (d.aiConfidence ?? 100) < 50),
        detail: 'Score OCR < 50 sur au moins un document',
      },
      {
        name: 'rejected_document',
        weight: 3,
        triggered: docs.some(d => d.status === 'rejected'),
        detail: 'Document rejeté par l\'IA',
      },
      {
        name: 'no_documents',
        weight: 2,
        triggered: docs.length === 0,
        detail: 'Aucun document soumis',
      },
      {
        name: 'profile_offer_mismatch',
        weight: 2,
        triggered: isProfileOfferMismatch(user?.profil ?? null, sub.offerId),
        detail: 'Incohérence profil/forfait',
      },
    ]

    const score = computeFraudScore(signals)
    const level = getFraudLevel(score)

    await db.update(subscriptions).set({ fraudScore: score, updatedAt: new Date() }).where(eq(subscriptions.id, subscriptionId))

    return { score, level, signals }
  }
}
