import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3'
import { sql } from './db'

export type HealthResponse = {
  status: 'ok' | 'degraded'
  service: 'comutitres-backend'
  timestamp: string
  uptime: number
  environment: string
  checks: {
    api: HealthCheck
    postgres: HealthCheck
    minio: HealthCheck
    publicApis: HealthCheck & { mock: boolean }
  }
}

type HealthCheck = {
  status: 'ok' | 'down'
  latencyMs?: number
  details?: string
}

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  async health(): Promise<HealthResponse> {
    const [postgres, minio] = await Promise.all([this.checkPostgres(), this.checkMinio()])
    const useMockApis = this.configService.get<string>('USE_MOCK_APIS') !== 'false'
    const status = postgres.status === 'ok' && minio.status === 'ok' ? 'ok' : 'degraded'

    return {
      status,
      service: 'comutitres-backend',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
      checks: {
        api: { status: 'ok' },
        postgres,
        minio,
        publicApis: {
          status: 'ok',
          mock: useMockApis,
          details: useMockApis ? 'mock mode enabled' : 'real mode enabled',
        },
      },
    }
  }

  private async checkPostgres(): Promise<HealthCheck> {
    const startedAt = Date.now()

    try {
      await sql`select 1`
      return { status: 'ok', latencyMs: Date.now() - startedAt }
    } catch (error: unknown) {
      return {
        status: 'down',
        latencyMs: Date.now() - startedAt,
        details: error instanceof Error ? error.message : 'postgres unavailable',
      }
    }
  }

  private async checkMinio(): Promise<HealthCheck> {
    const startedAt = Date.now()
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT') ?? 'localhost'
    const port = this.configService.get<string>('MINIO_PORT') ?? '9000'
    const accessKeyId = this.configService.get<string>('MINIO_ROOT_USER') ?? 'minioadmin'
    const secretAccessKey = this.configService.get<string>('MINIO_ROOT_PASSWORD') ?? 'minioadmin123'

    const client = new S3Client({
      region: 'eu-west-3',
      endpoint: `http://${endpoint}:${port}`,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    })

    try {
      await client.send(new ListBucketsCommand({}))
      return { status: 'ok', latencyMs: Date.now() - startedAt }
    } catch (error: unknown) {
      return {
        status: 'down',
        latencyMs: Date.now() - startedAt,
        details: error instanceof Error ? error.message : 'minio unavailable',
      }
    }
  }
}
