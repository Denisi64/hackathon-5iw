import { Body, Controller, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../common/types/shared'
import { PaymentsService } from './payments.service'
import { CreateCheckoutDto } from './dto/create-checkout.dto'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createCheckout(@CurrentUser() _user: JwtPayload, @Body() dto: CreateCheckoutDto) {
    return this.paymentsService.createCheckoutSession(dto.subscriptionId)
  }

  @Post('webhook')
  webhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string
    return this.paymentsService.handleWebhook(req.rawBody!, signature)
  }
}
