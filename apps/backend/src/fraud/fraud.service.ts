import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { documents, offers, subscriptions, users } from '../db/schema'
import type { UserProfile } from '../types/domain'
import { computeFraudScore, getFraudLevel } from './fraud-score.service'
import { buildFraudSignals } from './fraud-signals.builder'

@Injectable()
export class FraudService {
  async computeAndStore(subscriptionId: string): Promise<void> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1)
    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`)
    }

    const [offer] = await db.select().from(offers).where(eq(offers.id, subscription.offerId)).limit(1)
    const [payer] = await db.select().from(users).where(eq(users.id, subscription.payerId)).limit(1)
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.subscriptionId, subscriptionId))

    const signals = buildFraudSignals({
      subscriptionCreatedAt: subscription.createdAt!,
      subscriptionUpdatedAt: subscription.updatedAt!,
      offerProfiles: (offer?.profiles as UserProfile[]) ?? [],
      payerProfile: payer?.profile ?? null,
      documents: docs.map((doc) => ({
        aiConfidence: doc.aiConfidence,
        aiIssues: doc.aiIssues,
        expiresAt: doc.expiresAt,
      })),
    })

    const score = computeFraudScore(signals)
    const level = getFraudLevel(score)

    await db
      .update(subscriptions)
      .set({ fraudScore: score, fraudLevel: level, fraudSignals: signals, fraudCheckedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
  }
}
