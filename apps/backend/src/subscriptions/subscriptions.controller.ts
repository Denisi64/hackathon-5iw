import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { MockJwtAuthGuard } from '../common/guards/mock-jwt-auth.guard'
import type { JwtPayload } from '../types/domain'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { SubscriptionResponseDto } from './dto/subscription-response.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { SubscriptionsService } from './subscriptions.service'

@Controller('subscriptions')
@UseGuards(MockJwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.create(user, dto)
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.findOneForUser(user, id)
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.update(user, id, dto)
  }
}
