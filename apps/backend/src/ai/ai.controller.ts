import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { MockJwtAuthGuard } from '../common/guards/mock-jwt-auth.guard'
import { AiService } from './ai.service'
import { ChatRequestDto } from './dto/chat-request.dto'
import { RecommendRequestDto } from './dto/recommend-request.dto'

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @UseGuards(MockJwtAuthGuard)
  async chat(@Body() dto: ChatRequestDto, @Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')

    for await (const chunk of this.aiService.chatStream(dto.messages)) {
      res.write(chunk)
    }

    res.end()
  }

  @Post('recommend')
  recommend(@Body() dto: RecommendRequestDto) {
    return this.aiService.recommend(dto)
  }
}
