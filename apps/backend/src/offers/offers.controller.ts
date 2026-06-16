import { Controller, Get, Param, Query } from '@nestjs/common'
import type { ProfilUsager } from '../types/domain'
import { OfferResponseDto } from './dto/offer-response.dto'
import { OffersService } from './offers.service'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findAll(@Query('profil') profil?: ProfilUsager): Promise<OfferResponseDto[]> {
    return this.offersService.findAll(profil)
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OfferResponseDto> {
    return this.offersService.findOne(id)
  }
}
