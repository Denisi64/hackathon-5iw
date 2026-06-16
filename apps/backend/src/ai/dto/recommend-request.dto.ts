import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'
import type { UserProfile } from '../../types/domain'

const PROFILES: UserProfile[] = ['employee', 'student', 'junior_school', 'school', 'senior', 'tst', 'amethyste']

export class RecommendRequestDto {
  @IsIn(PROFILES)
  profile!: UserProfile

  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek!: number

  @IsInt()
  @Min(1)
  @Max(10)
  tripsPerDay!: number

  @IsInt()
  @Min(1)
  @Max(5)
  zones!: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  age?: number

  @IsOptional()
  @IsBoolean()
  scholarship?: boolean
}
