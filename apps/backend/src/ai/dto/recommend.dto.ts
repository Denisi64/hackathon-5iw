import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class RecommendDto {
  @IsString()
  @IsIn(['employee', 'student', 'junior_school', 'school', 'senior', 'tst', 'amethyste'])
  profile!: string

  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek!: number

  @IsInt()
  @Min(1)
  tripsPerDay!: number

  @IsInt()
  @Min(1)
  @Max(5)
  zones!: number

  @IsOptional()
  @IsNumber()
  age?: number

  @IsOptional()
  @IsBoolean()
  scholarship?: boolean
}
