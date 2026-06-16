import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ExternalApiService } from './external-api.service'

@Controller('verify')
@UseGuards(JwtAuthGuard)
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  @Post('caf')
  verifyCaf(@Body() body: { numeroAllocataire: string; codePostal: string }) {
    return this.externalApiService.verifyTSTEligibility(body.numeroAllocataire, body.codePostal)
  }

  @Post('student')
  verifyStudent(@Body() body: { ine: string }) {
    return this.externalApiService.verifyStudentStatus(body.ine)
  }

  @Post('scholarship')
  verifyScholarship(@Body() body: { ine: string }) {
    return this.externalApiService.verifyScholarshipStatus(body.ine)
  }
}
