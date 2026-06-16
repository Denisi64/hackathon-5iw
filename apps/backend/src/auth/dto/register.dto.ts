import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  password!: string

  @IsString()
  firstName!: string

  @IsString()
  lastName!: string

  @IsOptional()
  @IsIn(['salarie', 'etudiant', 'scolaire_junior', 'scolaire', 'senior', 'tst', 'amethyste'])
  profil?: string

  @IsOptional()
  @IsString()
  language?: string
}
