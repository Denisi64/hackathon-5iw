import type { SubscriptionStatus } from '../../types/domain'

export class SubscriptionResponseDto {
  declare id: string
  declare payerId: string
  declare holderId: string | null
  declare holderLastName: string | null
  declare holderFirstName: string | null
  declare holderDateOfBirth: string | null
  declare offerId: string
  declare status: SubscriptionStatus
  declare startDate: string | null
  declare endDate: string | null
  declare createdAt: string
  declare updatedAt: string
}
