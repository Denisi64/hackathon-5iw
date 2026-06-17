import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { subscriptions } from '../db/schema'
import { NotificationsService } from './notifications.service'

@Injectable()
export class NotificationsCron {
  private readonly logger = new Logger(NotificationsCron.name)

  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron('0 8 * * *')
  async checkLifecycleEvents() {
    this.logger.log('Vérification des événements lifecycle')

    const activeSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'))

    for (const sub of activeSubs) {
      await this.checkRenewal(sub)
      await this.checkTSTExpiry(sub)
    }
  }

  private async checkRenewal(sub: typeof subscriptions.$inferSelect) {
    if (!sub.endDate) return

    const daysLeft = Math.floor((sub.endDate.getTime() - Date.now()) / 86_400_000)

    if (daysLeft === 30 || daysLeft === 7) {
      await this.notificationsService.createNotification(
        sub.payerId,
        'renewal',
        `Votre abonnement expire dans ${daysLeft} jours — renouvelez en 1 clic`,
      )
    }
  }

  private async checkTSTExpiry(sub: typeof subscriptions.$inferSelect) {
    if (!sub.offerId.startsWith('tst') || !sub.endDate) return

    const daysLeft = Math.floor((sub.endDate.getTime() - Date.now()) / 86_400_000)

    if (daysLeft === 15 || daysLeft === 5) {
      await this.notificationsService.createNotification(
        sub.payerId,
        'tst_expiry',
        `Vos droits TST expirent dans ${daysLeft} jours — pensez à votre attestation CAF`,
      )
    }
  }
}
