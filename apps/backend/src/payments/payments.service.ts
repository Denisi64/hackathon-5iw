import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { db } from '../db'
import { offers, subscriptions } from '../db/schema'

const RENEWAL_TO_MONTHS: Record<string, number> = {
  annual: 12,
  monthly: 1,
  quarterly: 3,
  weekly: 1,
  usage: 1,
}

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2025-02-24.acacia',
    })
  }

  async createCheckoutSession(subscriptionId: string): Promise<{ checkoutUrl: string }> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1)
    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`)
    }

    const [offer] = await db.select().from(offers).where(eq(offers.id, subscription.offerId)).limit(1)
    if (!offer) {
      throw new NotFoundException(`Offer ${subscription.offerId} not found`)
    }

    const amount = offer.yearlyPrice ?? offer.monthlyPrice ?? 0
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: amount,
            product_data: { name: offer.name },
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/subscriptions/${subscriptionId}?payment=success`,
      cancel_url: `${frontendUrl}/subscriptions/${subscriptionId}?payment=cancelled`,
      metadata: { subscriptionId },
    })

    await db
      .update(subscriptions)
      .set({
        status: 'pending_payment',
        stripeCustomerId: session.customer as string | null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId))

    return { checkoutUrl: session.url! }
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const subscriptionId = session.metadata?.subscriptionId
    if (!subscriptionId) return

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1)
    if (!subscription) return

    const [offer] = await db.select().from(offers).where(eq(offers.id, subscription.offerId)).limit(1)
    const months = offer ? (RENEWAL_TO_MONTHS[offer.renewal ?? 'annual'] ?? 12) : 12

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + months)

    await db
      .update(subscriptions)
      .set({ status: 'active', startDate, endDate, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string): Stripe.Event {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? ''
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret)
  }
}
