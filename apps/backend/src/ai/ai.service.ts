import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { offers } from '../db/schema'
import { buildRecommendPrompt, CHATBOT_SYSTEM_PROMPT, RECOMMEND_SYSTEM_PROMPT, VISION_SYSTEM_PROMPT } from './prompts'
import type { RecommendDto } from './dto/recommend.dto'

@Injectable()
export class AiService {
  private readonly client: Anthropic

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: configService.get<string>('ANTHROPIC_API_KEY'),
    })
  }

  async verifyDocument(imageBase64: string, mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp') {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: VISION_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: 'Analyse ce document et retourne le JSON demandé.' },
        ],
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    return JSON.parse(text) as Record<string, unknown>
  }

  async recommend(dto: RecommendDto): Promise<{ offerId: string; reason: string }> {
    const activeOffers = await db.select({ id: offers.id }).from(offers).where(eq(offers.actif, true))
    const offerIds = activeOffers.map((o) => o.id)

    const userPrompt = buildRecommendPrompt(
      dto.profile,
      dto.daysPerWeek,
      dto.tripsPerDay,
      dto.zones,
      dto.age,
      dto.scholarship,
      offerIds,
    )

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: RECOMMEND_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const offerIdMatch = text.match(/offerId:\s*(\S+)/)
    const reasonMatch = text.match(/reason:\s*(.+)/)

    const offerId = offerIdMatch?.[1] ?? offerIds[0] ?? ''
    const reason = reasonMatch?.[1]?.trim() ?? ''

    const validId = offerIds.includes(offerId) ? offerId : (offerIds[0] ?? '')

    return { offerId: validId, reason }
  }

  async *chatStream(messages: { role: 'user' | 'assistant'; content: string }[]) {
    const stream = this.client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: CHATBOT_SYSTEM_PROMPT,
      messages,
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text
      }
    }
  }
}
