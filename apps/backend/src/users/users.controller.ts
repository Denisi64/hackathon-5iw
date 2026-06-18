import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../common/types/shared'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub)
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.sub, dto)
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.deleteAccount(user.sub)
  }

  @Get('me/subscription')
  getSubscription(@CurrentUser() user: JwtPayload) {
    return this.usersService.getSubscription(user.sub)
  }

  @Get('me/documents')
  getDocuments(@CurrentUser() user: JwtPayload) {
    return this.usersService.getDocuments(user.sub)
  }

  @Get('me/notifications')
  getNotifications(@CurrentUser() user: JwtPayload) {
    return this.usersService.getNotifications(user.sub)
  }

  @Patch('me/notifications/:id/read')
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.markNotificationRead(user.sub, id)
  }

  @Post('me/consents')
  saveConsent(
    @CurrentUser() user: JwtPayload,
    @Body() body: { type: 'rgpd' | 'cookies' | 'document_upload'; accepted: boolean },
  ) {
    return this.usersService.saveConsent(user.sub, body.type, body.accepted)
  }

  @Get('me/interests')
  getInterests(@CurrentUser() user: JwtPayload) {
    return this.usersService.getInterests(user.sub)
  }

  @Patch('me/interests')
  updateInterests(@CurrentUser() user: JwtPayload, @Body() body: { interests: string[] }) {
    return this.usersService.updateInterests(user.sub, body.interests)
  }

  @Get('me/gamification')
  getGamification(@CurrentUser() user: JwtPayload) {
    return this.usersService.getGamification(user.sub)
  }

  @Get('leaderboard')
  getLeaderboard(@CurrentUser() user: JwtPayload) {
    return this.usersService.getLeaderboard(user.sub)
  }
}
