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
  /** Faux quand aucune vraie cle Stripe n'est configuree (placeholder) -> mode demo. */
  private readonly stripeEnabled: boolean

  constructor(private readonly configService: ConfigService) {
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY') ?? ''
    this.stripeEnabled =
      secretKey.length > 0 && !secretKey.includes('XXX') && !secretKey.toLowerCase().includes('placeholder')
    this.stripe = new Stripe(secretKey || 'sk_test_unconfigured', {
      apiVersion: '2025-02-24.acacia',
    })
    this.webhookSecret = configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? ''
  }

  async createCheckoutSession(subscriptionId: string) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId)).limit(1)
    if (!sub) throw new NotFoundException('Souscription introuvable')

    const [offer] = await db.select().from(offers).where(eq(offers.id, sub.offerId)).limit(1)
    if (!offer) throw new NotFoundException('Offre introuvable')

    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173').replace(/\/+$/, '')

    // Mode demo : sans vraie cle Stripe, on simule un paiement reussi et on active la souscription.
    if (!this.stripeEnabled) {
      const start = new Date()
      await db
        .update(subscriptions)
        .set({ status: 'active', startDate: start, endDate: addPeriod(start, offer.renewal), updatedAt: new Date() })
        .where(eq(subscriptions.id, subscriptionId))
      return { url: `${frontendUrl}/mon-espace`, sessionId: 'demo' }
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: offer.monthlyPrice ?? 0,
          product_data: {
            name: offer.name,
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

/** Calcule la date d'echeance a partir de la periodicite de l'offre. */
function addPeriod(from: Date, renewal: string | null): Date {
  const d = new Date(from)
  switch (renewal) {
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
    case 'quarterly':
      d.setMonth(d.getMonth() + 3)
      break
    case 'annual':
    case 'usage':
    default:
      d.setFullYear(d.getFullYear() + 1)
  }
  return d
}
