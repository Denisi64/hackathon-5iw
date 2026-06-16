import { Module } from '@nestjs/common'
import { AiModule } from '../ai/ai.module'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'
import { MinioService } from './minio.service'

@Module({
  imports: [AiModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, MinioService],
})
export class DocumentsModule {}
