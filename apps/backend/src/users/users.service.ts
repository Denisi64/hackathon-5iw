import { Injectable, NotFoundException } from '@nestjs/common'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { consents, documents, notifications, subscriptions, users } from '../db/schema'
import type { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  async findById(id: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profile: users.profile,
        role: users.role,
        language: users.language,
        gdprConsent: users.gdprConsent,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) throw new NotFoundException('Utilisateur introuvable')
    return user
  }

  async update(id: string, dto: UpdateUserDto) {
    const [updated] = await db
      .update(users)
      .set({
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.profile && { profile: dto.profile as typeof users.$inferInsert['profile'] }),
        ...(dto.language && { language: dto.language }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName })

    if (!updated) throw new NotFoundException('Utilisateur introuvable')
    return updated
  }

  async getSubscription(userId: string) {
    const all = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.payerId, userId))
      .orderBy(desc(subscriptions.createdAt))

    const active = all.find((s) => s.status === 'active')
    return active ?? all[0] ?? null
  }

  async getDocuments(userId: string) {
    return db
      .select({ id: documents.id, type: documents.type, status: documents.status, createdAt: documents.createdAt })
      .from(documents)
      .innerJoin(subscriptions, eq(documents.subscriptionId, subscriptions.id))
      .where(eq(subscriptions.payerId, userId))
  }

  async getNotifications(userId: string) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt)
  }

  async markNotificationRead(userId: string, notificationId: string) {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, notificationId))

    return { success: true }
  }

  async saveConsent(userId: string, type: 'rgpd' | 'cookies' | 'document_upload', accepted: boolean) {
    const [consent] = await db
      .insert(consents)
      .values({ userId, type, accepted, acceptedAt: new Date() })
      .returning()

    if (accepted && type === 'rgpd') {
      await db.update(users).set({ gdprConsent: true, gdprConsentAt: new Date() }).where(eq(users.id, userId))
    }

    return consent
  }

  async getInterests(userId: string) {
    const [user] = await db.select({ interests: users.interests }).from(users).where(eq(users.id, userId)).limit(1)
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    return { interests: user.interests ?? [] }
  }

  async updateInterests(userId: string, interests: string[]) {
    const [updated] = await db
      .update(users)
      .set({ interests, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id, interests: users.interests })
    if (!updated) throw new NotFoundException('Utilisateur introuvable')
    return updated
  }

  async getGamification(userId: string) {
    const [user] = await db
      .select({ points: users.points, level: users.level, badges: users.badges })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    if (!user) throw new NotFoundException('Utilisateur introuvable')
    return {
      points: user.points ?? 0,
      level: user.level ?? 1,
      badges: user.badges ?? [],
      nextLevelPoints: (user.level ?? 1) * 500,
    }
  }

  async getLeaderboard(userId: string) {
    const all = await db
      .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, points: users.points, level: users.level, badges: users.badges })
      .from(users)
      .orderBy(desc(users.points))
      .limit(10)

    return all.map((u, i) => ({
      rank: i + 1,
      firstName: u.firstName,
      lastName: u.lastName[0] + '.',
      points: u.points ?? 0,
      level: u.level ?? 1,
      badgeCount: ((u.badges as string[]) ?? []).length,
      isMe: u.id === userId,
    }))
  }

  async deleteAccount(userId: string) {
    await db.update(users).set({ email: `deleted_${userId}@deleted.com`, passwordHash: '', updatedAt: new Date() }).where(eq(users.id, userId))
    return { message: 'Compte supprimé conformément au RGPD' }
  }
}
