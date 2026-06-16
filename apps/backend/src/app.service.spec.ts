import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import { AppService } from './app.service'

vi.mock('./db', () => ({
  sql: vi.fn().mockResolvedValue([{ ok: 1 }]),
}))

vi.mock('@aws-sdk/client-s3', () => ({
  ListBucketsCommand: class ListBucketsCommand {},
  S3Client: class S3Client {
    send() {
      return Promise.resolve({})
    }
  },
}))

describe('AppService', () => {
  it('returns a healthy status', async () => {
    const service = new AppService(
      new ConfigService({
        NODE_ENV: 'test',
        USE_MOCK_APIS: 'true',
        MINIO_ENDPOINT: 'localhost',
        MINIO_PORT: '9000',
        MINIO_ROOT_USER: 'minioadmin',
        MINIO_ROOT_PASSWORD: 'minioadmin123',
      }),
    )
    const health = await service.health()

    expect(health.status).toBe('ok')
    expect(health.service).toBe('comutitres-backend')
    expect(health.timestamp).toBeTruthy()
    expect(health.checks.postgres.status).toBe('ok')
    expect(health.checks.minio.status).toBe('ok')
    expect(health.checks.publicApis.mock).toBe(true)
  })
})
