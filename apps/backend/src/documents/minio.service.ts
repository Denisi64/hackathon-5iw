import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

@Injectable()
export class MinioService {
  private readonly s3: S3Client
  private readonly bucket: string

  constructor(private readonly configService: ConfigService) {
    const endpoint = configService.get<string>('MINIO_ENDPOINT') ?? 'minio'
    const port = configService.get<number>('MINIO_PORT') ?? 9000
    this.bucket = configService.get<string>('MINIO_BUCKET') ?? 'comutitres-documents'

    this.s3 = new S3Client({
      endpoint: `http://${endpoint}:${port}`,
      credentials: {
        accessKeyId: configService.get<string>('MINIO_ROOT_USER') ?? 'minioadmin',
        secretAccessKey: configService.get<string>('MINIO_ROOT_PASSWORD') ?? 'minioadmin123',
      },
      region: 'us-east-1',
      forcePathStyle: true,
    })
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }))
    return key
  }

  getPublicUrl(key: string): string {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT') ?? 'minio'
    const port = this.configService.get<number>('MINIO_PORT') ?? 9000
    return `http://${endpoint}:${port}/${this.bucket}/${key}`
  }
}
