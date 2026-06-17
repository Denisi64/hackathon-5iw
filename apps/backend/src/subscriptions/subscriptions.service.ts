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

  async create(payeurId: string, dto: CreateSubscriptionDto) {
    const [sub] = await db.insert(subscriptions).values({
      payeurId,
      offerId: dto.offerId,
      porteurId: dto.porteurId ?? null,
      porteurNom: dto.porteurNom ?? null,
      porteurPrenom: dto.porteurPrenom ?? null,
      porteurDdn: dto.porteurDdn ? new Date(dto.porteurDdn) : null,
      status: 'draft',
    }).returning()

    return sub
  }

  async findById(id: string, userId: string) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1)
    if (!sub) throw new NotFoundException('Souscription introuvable')
    if (sub.payeurId !== userId) throw new ForbiddenException()
    return sub
  }

  async update(id: string, userId: string, dto: UpdateSubscriptionDto) {
    await this.findById(id, userId)

    const [updated] = await db.update(subscriptions).set({
      ...(dto.status && { status: dto.status as typeof subscriptions.$inferInsert['status'] }),
      ...(dto.stripeSubscriptionId && { stripeSubscriptionId: dto.stripeSubscriptionId }),
      ...(dto.stripeCustomerId && { stripeCustomerId: dto.stripeCustomerId }),
      updatedAt: new Date(),
    }).where(eq(subscriptions.id, id)).returning()

    return updated
  }

  async confirm(id: string, userId: string) {
    await this.findById(id, userId)

    const [updated] = await db.update(subscriptions).set({
      status: 'pending_payment',
      updatedAt: new Date(),
    }).where(eq(subscriptions.id, id)).returning()

    await this.fraudScoreService.compute(id)

    return updated
  }

  async renew(id: string, userId: string) {
    const sub = await this.findById(id, userId)

    const [renewed] = await db.insert(subscriptions).values({
      payeurId: sub.payeurId,
      porteurId: sub.porteurId,
      offerId: sub.offerId,
      status: 'draft',
    }).returning()

    return renewed
  }

  async computeFraudScore(id: string, userId: string) {
    await this.findById(id, userId)
    return this.fraudScoreService.compute(id)
  }
}
