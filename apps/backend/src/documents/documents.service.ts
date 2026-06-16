import { Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { AiService } from '../ai/ai.service'
import { db } from '../db'
import { documents } from '../db/schema'
import { UploadDocumentDto } from './dto/upload-document.dto'
import { MinioService } from './minio.service'

export interface UploadedFilePayload {
  buffer: Buffer
  mimetype: string
  originalname: string
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly minio: MinioService,
    private readonly aiService: AiService,
  ) {}

  async upload(dto: UploadDocumentDto, file: UploadedFilePayload) {
    const key = `${dto.subscriptionId}/${randomUUID()}-${file.originalname}`
    await this.minio.upload(key, file.buffer, file.mimetype)

    const [row] = await db
      .insert(documents)
      .values({
        subscriptionId: dto.subscriptionId,
        type: dto.type,
        minioKey: key,
        status: 'uploaded',
      })
      .returning()

    const previewUrl = await this.minio.getPreviewUrl(key)

    return { id: row.id, type: row.type, status: row.status, previewUrl }
  }

  async verify(documentId: string) {
    const [row] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1)
    if (!row) {
      throw new NotFoundException(`Document ${documentId} not found`)
    }

    const { base64, contentType } = await this.minio.getObjectBase64(row.minioKey)
    const result = await this.aiService.verifyDocument(base64, contentType)

    await db
      .update(documents)
      .set({
        status: result.valid && result.confidence >= 50 ? 'valid' : 'rejected',
        aiConfidence: result.confidence,
        aiIssues: result.issues,
        aiExtractedData: JSON.stringify(result),
        validatedAt: new Date(),
        expiresAt: result.expiryDate ? new Date(result.expiryDate) : null,
      })
      .where(eq(documents.id, documentId))

    return { valid: result.valid, confidence: result.confidence, issues: result.issues }
  }
}
