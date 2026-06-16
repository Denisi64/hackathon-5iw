import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { offers, subscriptions } from '../db/schema'
import type { JwtPayload } from '../types/domain'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { SubscriptionResponseDto } from './dto/subscription-response.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'

function toResponse(row: typeof subscriptions.$inferSelect): SubscriptionResponseDto {
  return {
    id: row.id,
    payerId: row.payerId,
    holderId: row.holderId,
    holderLastName: row.holderLastName,
    holderFirstName: row.holderFirstName,
    holderDateOfBirth: row.holderDateOfBirth ? row.holderDateOfBirth.toISOString() : null,
    offerId: row.offerId,
    status: row.status as SubscriptionResponseDto['status'],
    startDate: row.startDate ? row.startDate.toISOString() : null,
    endDate: row.endDate ? row.endDate.toISOString() : null,
    createdAt: row.createdAt!.toISOString(),
    updatedAt: row.updatedAt!.toISOString(),
  }
}

@Injectable()
export class SubscriptionsService {
  async create(user: JwtPayload, dto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    const [offer] = await db.select().from(offers).where(eq(offers.id, dto.offerId)).limit(1)
    if (!offer) {
      throw new NotFoundException(`Offer ${dto.offerId} not found`)
    }

    const [row] = await db
      .insert(subscriptions)
      .values({
        payerId: user.sub,
        holderId: dto.holderId,
        holderLastName: dto.holderLastName,
        holderFirstName: dto.holderFirstName,
        holderDateOfBirth: dto.holderDateOfBirth ? new Date(dto.holderDateOfBirth) : undefined,
        offerId: dto.offerId,
        status: 'draft',
      })
      .returning()

    return toResponse(row)
  }

  async findOneForUser(user: JwtPayload, id: string): Promise<SubscriptionResponseDto> {
    const row = await this.findOrThrow(id)
    this.assertCanRead(user, row)
    return toResponse(row)
  }

  async update(user: JwtPayload, id: string, dto: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
    const row = await this.findOrThrow(id)
    this.assertCanWrite(user, row)

    if (dto.offerId) {
      const [offer] = await db.select().from(offers).where(eq(offers.id, dto.offerId)).limit(1)
      if (!offer) {
        throw new NotFoundException(`Offer ${dto.offerId} not found`)
      }
    }

    const [updated] = await db
      .update(subscriptions)
      .set({
        offerId: dto.offerId,
        holderId: dto.holderId,
        holderLastName: dto.holderLastName,
        holderFirstName: dto.holderFirstName,
        holderDateOfBirth: dto.holderDateOfBirth ? new Date(dto.holderDateOfBirth) : undefined,
        status: dto.status,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning()

    return toResponse(updated)
  }

  private async findOrThrow(id: string): Promise<typeof subscriptions.$inferSelect> {
    const [row] = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1)
    if (!row) {
      throw new NotFoundException(`Subscription ${id} not found`)
    }
    return row
  }

  private assertCanRead(user: JwtPayload, row: typeof subscriptions.$inferSelect): void {
    if (row.payerId !== user.sub && row.holderId !== user.sub) {
      throw new ForbiddenException()
    }
  }

  private assertCanWrite(user: JwtPayload, row: typeof subscriptions.$inferSelect): void {
    if (row.payerId !== user.sub) {
      throw new ForbiddenException()
    }
  }
}
