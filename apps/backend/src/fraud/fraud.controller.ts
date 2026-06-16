import { Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { MockJwtAuthGuard } from '../common/guards/mock-jwt-auth.guard'
import { FraudService } from './fraud.service'

@Controller('subscriptions')
@UseGuards(MockJwtAuthGuard)
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Post(':id/compute-fraud-score')
  @HttpCode(HttpStatus.NO_CONTENT)
  async compute(@Param('id') id: string): Promise<void> {
    await this.fraudService.computeAndStore(id)
  }
}
