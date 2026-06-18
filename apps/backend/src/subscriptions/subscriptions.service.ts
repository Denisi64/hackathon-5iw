import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { subscriptions } from '../db/schema'
import { FraudScoreService } from './fraud-score.service'
import type { CreateSubscriptionDto } from './dto/create-subscription.dto'
import type { UpdateSubscriptionDto } from './dto/update-subscription.dto'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly fraudScoreService: FraudScoreService) {}

  async create(payerId: string, dto: CreateSubscriptionDto) {
    const [sub] = await db
      .insert(subscriptions)
      .values({
        payerId,
        offerId: dto.offerId,
        holderId: dto.holderId ?? null,
        holderLastName: dto.holderLastName ?? null,
        holderFirstName: dto.holderFirstName ?? null,
        holderDateOfBirth: dto.holderDateOfBirth ? new Date(dto.holderDateOfBirth) : null,
        status: 'draft',
      })
      .returning()

    return sub
  }

  async findById(id: string, userId: string) {
    const [sub] = await db
      .select({
        id: subscriptions.id,
        payerId: subscriptions.payerId,
        holderId: subscriptions.holderId,
        holderLastName: subscriptions.holderLastName,
        holderFirstName: subscriptions.holderFirstName,
        holderDateOfBirth: subscriptions.holderDateOfBirth,
        offerId: subscriptions.offerId,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1)
    if (!sub) throw new NotFoundException('Souscription introuvable')
    if (sub.payerId !== userId) throw new ForbiddenException()
    return sub
  }

  async update(id: string, userId: string, dto: UpdateSubscriptionDto) {
    await this.findById(id, userId)

    const [updated] = await db
      .update(subscriptions)
      .set({
        ...(dto.status && { status: dto.status as typeof subscriptions.$inferInsert['status'] }),
        ...(dto.stripeSubscriptionId && { stripeSubscriptionId: dto.stripeSubscriptionId }),
        ...(dto.stripeCustomerId && { stripeCustomerId: dto.stripeCustomerId }),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning()

    return updated
  }

  async confirm(id: string, userId: string) {
    await this.findById(id, userId)

    const [updated] = await db
      .update(subscriptions)
      .set({ status: 'pending_payment', updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning()

    await this.fraudScoreService.compute(id)

    return updated
  }

  async renew(id: string, userId: string) {
    const sub = await this.findById(id, userId)

    const [renewed] = await db
      .insert(subscriptions)
      .values({
        payerId: sub.payerId,
        holderId: sub.holderId,
        offerId: sub.offerId,
        status: 'draft',
      })
      .returning()

    return renewed
  }

  async cancel(id: string, userId: string) {
    const sub = await this.findById(id, userId)
    if (sub.status !== 'draft') throw new ForbiddenException('Seules les souscriptions en brouillon peuvent être annulées')
    await db.delete(subscriptions).where(eq(subscriptions.id, id))
  }

  async computeFraudScore(id: string, userId: string): Promise<void> {
    await this.findById(id, userId)
    await this.fraudScoreService.compute(id)
  }
}
