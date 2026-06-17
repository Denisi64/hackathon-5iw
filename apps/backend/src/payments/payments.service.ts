import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { offers, subscriptions } from '../db/schema'

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe
  private readonly webhookSecret: string

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2025-02-24.acacia',
    })
    this.webhookSecret = configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? ''
  }

  async createCheckoutSession(subscriptionId: string) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1)
    if (!sub) throw new NotFoundException('Souscription introuvable')

    const [offer] = await db.select().from(offers).where(eq(offers.id, sub.offerId)).limit(1)
    if (!offer) throw new NotFoundException('Offre introuvable')

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: offer.prixMois ?? 0,
          product_data: {
            name: offer.nom,
            description: offer.description ?? undefined,
          },
        },
        quantity: 1,
      }],
      metadata: { subscriptionId },
      success_url: `${frontendUrl}/subscription/${subscriptionId}/success`,
      cancel_url: `${frontendUrl}/subscription/${subscriptionId}/cancel`,
    })

    return { url: session.url, sessionId: session.id }
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret)
    } catch {
      throw new Error('Webhook signature invalide')
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const subscriptionId = session.metadata?.subscriptionId

      if (subscriptionId) {
        await db.update(subscriptions).set({
          status: 'active',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          startDate: new Date(),
          updatedAt: new Date(),
        }).where(eq(subscriptions.id, subscriptionId))
      }
    }

    return { received: true }
  }
}
