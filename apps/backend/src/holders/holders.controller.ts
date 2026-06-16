import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../common/types/shared'
import { HoldersService } from './holders.service'
import { CreateHolderDto } from './dto/create-holder.dto'

@Controller('holders')
@UseGuards(JwtAuthGuard)
export class HoldersController {
  constructor(private readonly holdersService: HoldersService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateHolderDto) {
    return this.holdersService.create(user.sub, dto)
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.holdersService.findAllByPayeur(user.sub)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holdersService.findOne(id)
  }

  @Get(':id/readonly')
  getReadonlyView(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.holdersService.getReadonlyView(id, user.sub)
  }
}
