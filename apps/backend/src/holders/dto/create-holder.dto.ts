import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateHolderDto {
  @IsString()
  nom!: string

  @IsString()
  prenom!: string

  @IsDateString()
  ddn!: string

  @IsOptional()
  @IsUUID()
  holderId?: string
}
