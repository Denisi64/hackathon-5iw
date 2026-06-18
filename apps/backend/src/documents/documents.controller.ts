import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { DocumentsService } from './documents.service'
import { documentTypeEnum } from '../db/schema'

type DocumentType = (typeof documentTypeEnum.enumValues)[number]

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('subscriptionId') subscriptionId: string,
    @Body('type') type: DocumentType,
  ) {
    return this.documentsService.upload(subscriptionId, type, file)
  }

  @Post('verify')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  verify(
    @UploadedFile() file: Express.Multer.File,
    @Body('subscriptionId') subscriptionId: string,
  ) {
    return this.documentsService.verify(subscriptionId, file)
  }

  @Get('subscription/:subscriptionId')
  findBySubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.documentsService.findBySubscription(subscriptionId)
  }
}
