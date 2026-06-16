import { NotFoundException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve([]),
      }),
    }),
  },
}))

describe('DocumentsService', () => {
  it('throws NotFoundException when verifying an unknown document', async () => {
    const aiService = { verifyDocument: vi.fn() } as never
    const minio = { upload: vi.fn(), getPreviewUrl: vi.fn(), getObjectBase64: vi.fn() } as never
    const { DocumentsService } = await import('./documents.service')
    const service = new DocumentsService(minio, aiService)

    await expect(service.verify('00000000-0000-0000-0000-000000000000')).rejects.toThrow(NotFoundException)
  })
})
