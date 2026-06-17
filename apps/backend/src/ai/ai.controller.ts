import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AiService } from './ai.service'
import { ChatDto } from './dto/chat.dto'
import { RecommendDto } from './dto/recommend.dto'
import { VerifyDocumentDto } from './dto/verify-document.dto'

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Body() dto: ChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    try {
      for await (const chunk of this.aiService.chatStream(dto.messages)) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
      }
    } finally {
      res.write('data: [DONE]\n\n')
      res.end()
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-document')
  verifyDocument(@Body() dto: VerifyDocumentDto) {
    return this.aiService.verifyDocument(dto.imageBase64, dto.mimeType)
  }

  @Post('recommend')
  recommend(@Body() dto: RecommendDto) {
    return this.aiService.recommend(dto)
  }
}
