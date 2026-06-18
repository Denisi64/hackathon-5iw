import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from '../db'
import { documents, documentTypeEnum, subscriptions } from '../db/schema'
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

  private async advanceSubscriptionIfReady(subscriptionId: string) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId))
    if (!sub || sub.status !== 'pending_documents') return

    const docs = await db.select().from(documents).where(
      and(eq(documents.subscriptionId, subscriptionId), eq(documents.status, 'valid'))
    )
    if (docs.length === 0) return

    await db.update(subscriptions)
      .set({ status: 'pending_payment', updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
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

    if (aiResult.valid) await this.advanceSubscriptionIfReady(subscriptionId)

    return {
      ...doc,
      valid: aiResult.valid,
      confidence: aiResult.confidence,
      issues: aiResult.issues,
    }
  }

  async validate(documentId: string) {
    const [doc] = await db.update(documents)
      .set({ status: 'valid' })
      .where(eq(documents.id, documentId))
      .returning()
    if (!doc) return null
    await this.advanceSubscriptionIfReady(doc.subscriptionId)
    return doc
  }

  async reject(documentId: string) {
    const [doc] = await db.update(documents)
      .set({ status: 'rejected' })
      .where(eq(documents.id, documentId))
      .returning()
    return doc ?? null
  }

  findPending() {
    return db.select().from(documents).where(eq(documents.status, 'uploaded'))
  }

  findBySubscription(subscriptionId: string) {
    return db.select().from(documents).where(eq(documents.subscriptionId, subscriptionId))
  }
}
