import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../common/types/shared'
import { SubscriptionsService } from './subscriptions.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(user.sub, dto)
  }

  @Get(':id')
  findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subscriptionsService.findById(id, user.sub)
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, user.sub, dto)
  }

  @Post(':id/confirm')
  confirm(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subscriptionsService.confirm(id, user.sub)
  }

  @Post(':id/renew')
  renew(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subscriptionsService.renew(id, user.sub)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subscriptionsService.cancel(id, user.sub)
  }

  @Post(':id/compute-fraud-score')
  @HttpCode(HttpStatus.NO_CONTENT)
  computeFraudScore(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subscriptionsService.computeFraudScore(id, user.sub)
  }
}
