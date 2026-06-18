import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../common/types/shared'
import { TripsService } from './trips.service'

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('log')
  logTrip(@CurrentUser() user: JwtPayload, @Body() body: {
    line: string; toLine?: string; lineType: 'metro' | 'rer' | 'bus' | 'tram' | 'transilien'
    from: string; to: string; departureTime: string; arrivalTime: string
    duration: number; zones: number[]; itineraryData?: unknown; co2Saved: number
  }) {
    return this.tripsService.logTrip(user.sub, body)
  }

  @Get('history')
  getHistory(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getHistory(user.sub)
  }

  @Get('today')
  getTodayTrips(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getTodayTrips(user.sub)
  }

  @Get('week')
  getWeekStats(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getWeekStats(user.sub)
  }

  @Get('stats')
  getDetailedStats(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getDetailedStats(user.sub)
  }

  @Get('favorites')
  getFavoriteLines(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getFavoriteLines(user.sub)
  }

  @Get('alerts')
  getAlerts(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getAlerts(user.sub)
  }
}
