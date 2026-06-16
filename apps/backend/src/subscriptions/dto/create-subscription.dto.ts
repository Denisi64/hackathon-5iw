import { Type } from 'class-transformer'
import { IsISO8601, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator'

export class CreateSubscriptionDto {
  @IsString()
  offerId!: string

  @IsOptional()
  @IsUUID()
  holderId?: string

  @ValidateIf((dto: CreateSubscriptionDto) => !dto.holderId)
  @IsString()
  holderLastName?: string

  @ValidateIf((dto: CreateSubscriptionDto) => !dto.holderId)
  @IsString()
  holderFirstName?: string

  @ValidateIf((dto: CreateSubscriptionDto) => !dto.holderId)
  @IsISO8601()
  @Type(() => String)
  holderDateOfBirth?: string
}
