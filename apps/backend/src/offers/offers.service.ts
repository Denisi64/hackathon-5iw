import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { offers } from '../db/schema'
import type { ProfilUsager } from '../types/domain'
import { OfferResponseDto } from './dto/offer-response.dto'

function centsToEuros(value: number | null): number | null {
  return value === null ? null : value / 100
}

function toOfferResponse(row: typeof offers.$inferSelect): OfferResponseDto {
  return {
    id: row.id,
    nom: row.nom,
    description: row.description,
    prixAn: centsToEuros(row.prixAn),
    prixMois: centsToEuros(row.prixMois),
    renouvellement: row.renouvellement,
    profils: row.profils as ProfilUsager[],
    justificatifsRequis: row.justificatifsRequis as string[],
    meta: row.meta as Record<string, unknown> | null,
  }
}

@Injectable()
export class OffersService {
  async findAll(profil?: ProfilUsager): Promise<OfferResponseDto[]> {
    const rows = await db.select().from(offers).where(eq(offers.actif, true))
    const filtered = profil
      ? rows.filter((row) => (row.profils as ProfilUsager[]).includes(profil))
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
