import { Module } from '@nestjs/common'
import { SubscriptionsController } from './subscriptions.controller'
import { SubscriptionsService } from './subscriptions.service'
import { FraudScoreService } from './fraud-score.service'

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, FraudScoreService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
