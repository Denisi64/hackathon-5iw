import { Controller, Get, Param } from '@nestjs/common'
import { OffersService } from './offers.service'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findAll() {
    return this.offersService.findAll()
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.offersService.findById(id)
  }
}
