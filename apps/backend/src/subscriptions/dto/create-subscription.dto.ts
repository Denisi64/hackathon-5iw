import { IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateSubscriptionDto {
  @IsString()
  offerId!: string

  @IsOptional()
  @IsUUID()
  porteurId?: string

  @IsOptional()
  @IsString()
  porteurNom?: string

  @IsOptional()
  @IsString()
  porteurPrenom?: string

  @IsOptional()
  @IsString()
  porteurDdn?: string
}
