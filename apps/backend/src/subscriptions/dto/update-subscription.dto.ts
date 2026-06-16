import { IsIn, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator'

const EDITABLE_STATUSES = ['draft', 'pending_documents', 'pending_payment'] as const

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  offerId?: string

  @IsOptional()
  @IsUUID()
  holderId?: string

  @IsOptional()
  @IsString()
  holderLastName?: string

  @IsOptional()
  @IsString()
  holderFirstName?: string

  @IsOptional()
  @IsISO8601()
  holderDateOfBirth?: string

  @IsOptional()
  @IsIn(EDITABLE_STATUSES)
  status?: (typeof EDITABLE_STATUSES)[number]
}
