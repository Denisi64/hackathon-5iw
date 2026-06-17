import { IsIn, IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsIn(['employee', 'student', 'junior_school', 'school', 'senior', 'tst', 'amethyste'])
  profile?: string

  @IsOptional()
  @IsString()
  language?: string
}
