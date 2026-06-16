import { Controller, Param, Post, UseGuards } from '@nestjs/common'
import { MockJwtAuthGuard } from '../common/guards/mock-jwt-auth.guard'
import { PaymentsService } from './payments.service'

@Controller('subscriptions')
@UseGuards(MockJwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.paymentsService.createCheckoutSession(id)
  }
}
