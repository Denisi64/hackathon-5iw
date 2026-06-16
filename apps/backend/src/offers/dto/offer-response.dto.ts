import type { UserProfile } from '../../types/domain'

export class OfferResponseDto {
  declare id: string
  declare name: string
  declare description: string | null
  declare yearlyPrice: number | null
  declare monthlyPrice: number | null
  declare renewal: string | null
  declare profiles: UserProfile[]
  declare requiredDocuments: string[]
  declare meta: Record<string, unknown> | null
}
