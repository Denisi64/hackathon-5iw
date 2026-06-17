import { Controller, Get, Param, Query } from '@nestjs/common'
import { OffersService } from './offers.service'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findAll(@Query('profile') profile?: string) {
    return this.offersService.findAll(profile)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.offersService.findById(id)
  }
}
