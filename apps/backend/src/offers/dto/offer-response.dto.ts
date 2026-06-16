import type { ProfilUsager } from '../../types/domain'

export class OfferResponseDto {
  declare id: string
  declare nom: string
  declare description: string | null
  declare prixAn: number | null
  declare prixMois: number | null
  declare renouvellement: string | null
  declare profils: ProfilUsager[]
  declare justificatifsRequis: string[]
  declare meta: Record<string, unknown> | null
}
