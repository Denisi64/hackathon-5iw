import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MockJwtAuthGuard } from '../common/guards/mock-jwt-auth.guard'
import { DocumentsService } from './documents.service'
import { UploadDocumentDto } from './dto/upload-document.dto'
import { VerifyDocumentDto } from './dto/verify-document.dto'

@Controller('documents')
@UseGuards(MockJwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File | undefined, @Body() dto: UploadDocumentDto) {
    if (!file) {
      throw new BadRequestException('file is required')
    }
    return this.documentsService.upload(dto, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    })
  }

  @Post('verify')
  verify(@Body() dto: VerifyDocumentDto) {
    return this.documentsService.verify(dto.documentId)
  }
}
