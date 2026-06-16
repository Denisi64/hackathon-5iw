import { IsIn, IsUUID } from 'class-validator'

const DOCUMENT_TYPES = [
  'id_document',
  'family_booklet',
  'school_certificate',
  'scholarship_certificate',
  'caf_certificate',
  'tax_notice',
  'disability_card',
  'mdph_notification',
] as const

export class UploadDocumentDto {
  @IsUUID()
  subscriptionId!: string

  @IsIn(DOCUMENT_TYPES)
  type!: (typeof DOCUMENT_TYPES)[number]
}
