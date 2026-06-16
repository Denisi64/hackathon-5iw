import Anthropic from '@anthropic-ai/sdk'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OffersService } from '../offers/offers.service'
import type { ChatMessageDto } from './dto/chat-request.dto'
import type { RecommendRequestDto } from './dto/recommend-request.dto'
import { CHATBOT_SYSTEM_PROMPT, VISION_SYSTEM_PROMPT, buildRecommendPrompt } from './prompts'

export interface VisionResult {
  documentType: string
  lastName: string | null
  firstName: string | null
  birthDate: string | null
  expiryDate: string | null
  schoolYear: string | null
  institution: string | null
  valid: boolean
  confidence: number
  issues: string[]
  readable: boolean
}

const MODEL = 'claude-sonnet-4-6'

@Injectable()
export class AiService {
  private readonly client: Anthropic

  constructor(
    config: ConfigService,
    private readonly offersService: OffersService,
  ) {
    this.client = new Anthropic({ apiKey: config.get<string>('ANTHROPIC_API_KEY') })
  }

  async *chatStream(messages: ChatMessageDto[]): AsyncGenerator<string> {
    const stream = this.client.messages.stream({
      model: MODEL,
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

  async verifyDocument(imageBase64: string, mimeType: string): Promise<VisionResult> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: VISION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType as 'image/jpeg', data: imageBase64 },
            },
            { type: 'text', text: 'Analyze this document and return the requested JSON.' },
          ],
        },
      ],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    return JSON.parse(text) as VisionResult
  }

  async recommend(params: RecommendRequestDto): Promise<{ offerId: string; reason: string }> {
    const available = await this.offersService.findAll(params.profile)
    const prompt = buildRecommendPrompt(
      params,
      available.map((o) => ({ id: o.id, name: o.name, profiles: o.profiles })),
    )

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 256,
      system: CHATBOT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const offerIdMatch = text.match(/offerId:\s*(\S+)/)
    const reasonMatch = text.match(/reason:\s*(.+)/)

    const offerId = offerIdMatch?.[1]
    const validIds = new Set(available.map((o) => o.id))

    if (offerId && validIds.has(offerId)) {
      return { offerId, reason: reasonMatch?.[1]?.trim() ?? '' }
    }

    const fallback = available[0]
    return {
      offerId: fallback?.id ?? 'navigo_mois',
      reason: reasonMatch?.[1]?.trim() ?? 'Offer recommended based on your profile.',
    }
  }
}
