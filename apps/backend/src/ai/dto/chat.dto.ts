import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class MessageDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant'

  @IsString()
  content!: string
}

export class ChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages!: MessageDto[]
}
