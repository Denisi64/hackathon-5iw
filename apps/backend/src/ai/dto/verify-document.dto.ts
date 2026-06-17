import { IsIn, IsString } from 'class-validator'

export class VerifyDocumentDto {
  @IsString()
  imageBase64!: string

  @IsIn(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
  mimeType!: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
}
