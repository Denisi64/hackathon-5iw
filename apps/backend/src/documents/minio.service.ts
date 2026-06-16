import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MinioService {
  private readonly client: S3Client
  private readonly bucket: string

  constructor(config: ConfigService) {
    this.client = new S3Client({
      endpoint: `http://${config.get<string>('MINIO_ENDPOINT') ?? 'localhost'}:${config.get<string>('MINIO_PORT') ?? '9000'}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.get<string>('MINIO_ROOT_USER') ?? 'minioadmin',
        secretAccessKey: config.get<string>('MINIO_ROOT_PASSWORD') ?? 'minioadmin123',
      },
      forcePathStyle: true,
    })
    this.bucket = config.get<string>('MINIO_BUCKET') ?? 'comutitres-documents'
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }),
    )
  }

  async getPreviewUrl(key: string): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: 300,
    })
  }

  async getObjectBase64(key: string): Promise<{ base64: string; contentType: string }> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }))
    const bytes = await result.Body!.transformToByteArray()
    return {
      base64: Buffer.from(bytes).toString('base64'),
      contentType: result.ContentType ?? 'application/octet-stream',
    }
  }
}
