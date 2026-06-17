import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '../db'
import { documents, documentTypeEnum } from '../db/schema'
import { MinioService } from './minio.service'
import { AiService } from '../ai/ai.service'

type DocumentType = (typeof documentTypeEnum.enumValues)[number]

const KNOWN_DOCUMENT_TYPES = new Set<string>(documentTypeEnum.enumValues)

function toDocumentType(raw: unknown): DocumentType {
  if (typeof raw === 'string' && KNOWN_DOCUMENT_TYPES.has(raw)) return raw as DocumentType
  return 'inconnu'
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly minioService: MinioService,
    private readonly aiService: AiService,
  ) {}

  async upload(subscriptionId: string, type: DocumentType, file: Express.Multer.File) {
    const key = `${subscriptionId}/${randomUUID()}-${file.originalname}`
    await this.minioService.upload(key, file.buffer, file.mimetype)

    const [doc] = await db.insert(documents).values({
      subscriptionId,
      type,
      minioKey: key,
      status: 'uploaded',
    }).returning()

    return { ...doc, url: this.minioService.getPublicUrl(key) }
  }

  async verify(subscriptionId: string, file: Express.Multer.File) {
    const key = `${subscriptionId}/${randomUUID()}-${file.originalname}`
    await this.minioService.upload(key, file.buffer, file.mimetype)

    const base64 = file.buffer.toString('base64')
    const mimeType = file.mimetype as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    const aiResult = await this.aiService.verifyDocument(base64, mimeType)

    const [doc] = await db.insert(documents).values({
      subscriptionId,
      type: toDocumentType(aiResult.documentType),
      minioKey: key,
      status: aiResult.valid ? 'valid' : 'rejected',
      aiConfidence: aiResult.confidence as number,
      aiExtractedData: JSON.stringify(aiResult),
      expiresAt: aiResult.expiryDate ? new Date(aiResult.expiryDate as string) : null,
    }).returning()

    return {
      ...doc,
      valid: aiResult.valid,
      confidence: aiResult.confidence,
      issues: aiResult.issues,
    }
  }

  findBySubscription(subscriptionId: string) {
    return db.select().from(documents).where(eq(documents.subscriptionId, subscriptionId))
  }
}
