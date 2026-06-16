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
  @IsIn(['employee', 'student', 'junior_school', 'school', 'senior', 'tst', 'amethyste'])
  profile?: string

  @IsOptional()
  @IsString()
  language?: string
}
