import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { holders } from '../db/schema'
import type { CreateHolderDto } from './dto/create-holder.dto'

@Injectable()
export class HoldersService {
  async create(payeurId: string, dto: CreateHolderDto) {
    const [holder] = await db
      .insert(holders)
      .values({
        payeurId,
        holderId: dto.holderId ?? null,
        nom: dto.nom,
        prenom: dto.prenom,
        ddn: dto.ddn,
      })
      .returning()

    return holder
  }

  async findAllByPayeur(payeurId: string) {
    return db.select().from(holders).where(eq(holders.payeurId, payeurId))
  }

  async findOne(id: string) {
    const [holder] = await db.select().from(holders).where(eq(holders.id, id)).limit(1)
    if (!holder) throw new NotFoundException('Porteur introuvable')
    return holder
  }

  async getReadonlyView(id: string, userId: string) {
    const holder = await this.findOne(id)
    if (holder.holderId !== userId) throw new ForbiddenException()

    return {
      nom: holder.nom,
      prenom: holder.prenom,
      ddn: holder.ddn,
      canSelfManage: holder.canSelfManage,
    }
  }
}
