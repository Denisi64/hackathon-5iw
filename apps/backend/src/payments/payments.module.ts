import { Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { WebhookController } from './webhook.controller'

@Module({
  controllers: [PaymentsController, WebhookController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
