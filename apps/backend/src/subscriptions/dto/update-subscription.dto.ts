import { IsIn, IsOptional, IsString } from 'class-validator'

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsIn(['draft', 'pending_documents', 'pending_payment', 'active', 'suspended', 'cancelled', 'expired'])
  status?: string

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string

  @IsOptional()
  @IsString()
  stripeCustomerId?: string
}
