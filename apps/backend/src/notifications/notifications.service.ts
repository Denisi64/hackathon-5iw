import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { notifications, notificationTypeEnum } from '../db/schema'

type NotificationType = (typeof notificationTypeEnum.enumValues)[number]

@Injectable()
export class NotificationsService {
  async createNotification(userId: string, type: NotificationType, message: string) {
    const [notification] = await db.insert(notifications).values({ userId, type, message }).returning()
    return notification
  }

  async findByUser(userId: string) {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(notifications.createdAt)
  }

  async markRead(notificationId: string) {
    await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.id, notificationId))
    return { success: true }
  }

  async registerPushToken(_userId: string, _token: string) {
    // TODO Sprint 4: stocker le push token pour les notifications mobiles
    return { registered: true }
  }
}
