import { BadRequestException, Controller, Headers, Post, Req } from '@nestjs/common'
import { RawBodyRequest } from '@nestjs/common'
import type { Request } from 'express'
import type Stripe from 'stripe'
import { PaymentsService } from './payments.service'

@Controller('payments')
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!signature || !req.rawBody) {
      throw new BadRequestException('Missing Stripe signature')
    }

    const event: Stripe.Event = this.paymentsService.verifyWebhookSignature(req.rawBody, signature)

    if (event.type === 'checkout.session.completed') {
      await this.paymentsService.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
    }

    return { received: true }
  }
}
