import { Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { offers } from '../db/schema'

@Injectable()
export class OffersService {
  findAll() {
    return db.select().from(offers).where(eq(offers.actif, true))
  }

  async findById(id: string) {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id)).limit(1)
    if (!offer) throw new NotFoundException('Offre introuvable')
    return offer
  }
}
