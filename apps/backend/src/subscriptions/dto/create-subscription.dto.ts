import { IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateSubscriptionDto {
  @IsString()
  offerId!: string

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
  @IsString()
  holderDateOfBirth?: string
}
