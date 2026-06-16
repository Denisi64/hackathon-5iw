import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { offers } from '../db/schema'
import type { UserProfile } from '../types/domain'
import { OfferResponseDto } from './dto/offer-response.dto'

function centsToEuros(value: number | null): number | null {
  return value === null ? null : value / 100
}

function toOfferResponse(row: typeof offers.$inferSelect): OfferResponseDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    yearlyPrice: centsToEuros(row.yearlyPrice),
    monthlyPrice: centsToEuros(row.monthlyPrice),
    renewal: row.renewal,
    profiles: row.profiles as UserProfile[],
    requiredDocuments: row.requiredDocuments as string[],
    meta: row.meta as Record<string, unknown> | null,
  }
}

@Injectable()
export class OffersService {
  async findAll(profile?: UserProfile): Promise<OfferResponseDto[]> {
    const rows = await db.select().from(offers).where(eq(offers.active, true))
    const filtered = profile
      ? rows.filter((row) => (row.profiles as UserProfile[]).includes(profile))
      : rows
    return filtered.map(toOfferResponse)
  }

  async findOne(id: string): Promise<OfferResponseDto> {
    const [row] = await db.select().from(offers).where(eq(offers.id, id)).limit(1)
    if (!row) {
      throw new NotFoundException(`Offer ${id} not found`)
    }
    return toOfferResponse(row)
  }
}
