import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { computeTSTLevel } from './caf.service'

@Injectable()
export class ExternalApiService {
  private readonly useMock: boolean

  constructor(private readonly configService: ConfigService) {
    this.useMock = this.configService.get<string>('USE_MOCK_APIS') !== 'false'
  }

  async verifyTSTEligibility(allocateeNumber: string, postalCode: string) {
    if (this.useMock) {
      await this.delay(800)
      const quotientFamilial = 580
      return { valid: true, source: 'mock', quotientFamilial, tstLevel: computeTSTLevel(quotientFamilial), allocateeNumber, postalCode }
    }
    throw new Error('CAF API not configured for production')
  }

  async verifyStudentStatus(ine: string) {
    if (this.useMock) {
      await this.delay(600)
      return { valid: true, source: 'mock', enrolled: true, institution: 'Université Paris Cité', year: '2025-2026', ine }
    }
    throw new Error('Student status API not configured for production')
  }

  async verifyScholarshipStatus(ine: string) {
    if (this.useMock) {
      await this.delay(500)
      return { valid: true, source: 'mock', scholar: true, level: '4', ine }
    }
    throw new Error('Scholarship API not configured for production')
  }

  private delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
}
