import { IsIn, IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsIn(['salarie', 'etudiant', 'scolaire_junior', 'scolaire', 'senior', 'tst', 'amethyste'])
  profil?: string

  @IsOptional()
  @IsString()
  language?: string
}
