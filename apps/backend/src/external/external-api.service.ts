import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ExternalApiService {
  private readonly useMock: boolean

  constructor(private readonly configService: ConfigService) {
    this.useMock = this.configService.get<string>('USE_MOCK_APIS') !== 'false'
  }

  async verifyTSTEligibility(numeroAllocataire: string, codePostal: string) {
    if (this.useMock) {
      await this.delay(800)
      return { valid: true, source: 'mock', quotientFamilial: 580, niveauTST: 'tst_75', numeroAllocataire, codePostal }
    }
    // TODO prod: appel API Particulier CNAF
    // https://particulier.api.gouv.fr/api/v2/composition-familiale
    throw new Error('API CAF non configurée en production')
  }

  async verifyStudentStatus(ine: string) {
    if (this.useMock) {
      await this.delay(600)
      return { valid: true, source: 'mock', inscrit: true, etablissement: 'Université Paris Cité', annee: '2025-2026', ine }
    }
    // TODO prod: appel API Statut Étudiant MESRI
    throw new Error('API Statut Étudiant non configurée en production')
  }

  async verifyScholarshipStatus(ine: string) {
    if (this.useMock) {
      await this.delay(500)
      return { valid: true, source: 'mock', boursier: true, echelon: '4', ine }
    }
    // TODO prod: appel API Statut Boursier MESRI
    throw new Error('API Statut Boursier non configurée en production')
  }

  private delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
}
