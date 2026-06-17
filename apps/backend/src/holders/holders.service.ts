import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { holders } from '../db/schema'
import type { CreateHolderDto } from './dto/create-holder.dto'

@Injectable()
export class HoldersService {
  async create(payerId: string, dto: CreateHolderDto) {
    const [holder] = await db
      .insert(holders)
      .values({
        payerId,
        userId: dto.userId ?? null,
        lastName: dto.lastName,
        firstName: dto.firstName,
        dateOfBirth: dto.dateOfBirth,
      })
      .returning()

    return holder
  }

  async findAllByPayeur(payerId: string) {
    return db.select().from(holders).where(eq(holders.payerId, payerId))
  }

  async findOne(id: string) {
    const [holder] = await db.select().from(holders).where(eq(holders.id, id)).limit(1)
    if (!holder) throw new NotFoundException('Porteur introuvable')
    return holder
  }

  async getReadonlyView(id: string, userId: string) {
    const holder = await this.findOne(id)
    if (holder.userId !== userId) throw new ForbiddenException()

    return {
      lastName: holder.lastName,
      firstName: holder.firstName,
      dateOfBirth: holder.dateOfBirth,
      canSelfManage: holder.canSelfManage,
    }
  }
}
