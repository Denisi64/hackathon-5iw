import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateHolderDto {
  @IsString()
  lastName!: string

  @IsString()
  firstName!: string

  @IsDateString()
  dateOfBirth!: string

  @IsOptional()
  @IsUUID()
  userId?: string
}
