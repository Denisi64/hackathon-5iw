import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { offers } from '../db/schema'
import { buildRecommendPrompt, CHATBOT_SYSTEM_PROMPT, RECOMMEND_SYSTEM_PROMPT, VISION_SYSTEM_PROMPT } from './prompts'
import type { RecommendDto } from './dto/recommend.dto'

type AiProvider = 'mock' | 'ollama' | 'anthropic'

@Injectable()
export class AiService {
  private readonly provider: AiProvider
  private readonly client: Anthropic | null

  constructor(private readonly configService: ConfigService) {
    const apiKey = configService.get<string>('ANTHROPIC_API_KEY')
    this.provider = this.resolveProvider(apiKey)
    this.client = this.provider === 'anthropic' ? new Anthropic({ apiKey }) : null
  }

  async verifyDocument(imageBase64: string, mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp') {
    if (!this.client) {
      return {
        documentType: 'inconnu',
        lastName: null,
        firstName: null,
        birthDate: null,
        expiryDate: null,
        schoolYear: null,
        institution: null,
        valid: true,
        confidence: 70,
        issues: ['Mode IA de test actif'],
        readable: imageBase64.length > 0 && mimeType.length > 0,
      }
    }

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
    const activeOffers = await db.select({ id: offers.id }).from(offers).where(eq(offers.active, true))
    const offerIds = activeOffers.map((o) => o.id)

    if (!this.client) {
      const offerId = this.pickMockOffer(dto, offerIds)
      return {
        offerId,
        reason: 'Mode IA de test actif : recommandation calculee localement pour valider le parcours.',
      }
    }

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
    if (this.provider === 'mock') {
      yield* this.mockChatStream(messages)
      return
    }

    if (this.provider === 'ollama') {
      yield* this.ollamaChatStream(messages)
      return
    }

    if (!this.client) {
      yield* this.mockChatStream(messages)
      return
    }

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

  private resolveProvider(apiKey: string | undefined): AiProvider {
    const provider = this.configService.get<string>('AI_PROVIDER')?.toLowerCase()
    if (provider === 'mock' || provider === 'ollama') return provider
    if (provider === 'anthropic' && apiKey && !apiKey.includes('XXXXXXXX')) return 'anthropic'
    if (!provider && apiKey && !apiKey.includes('XXXXXXXX')) return 'anthropic'
    return 'mock'
  }

  private async *ollamaChatStream(messages: { role: 'user' | 'assistant'; content: string }[]) {
    try {
      const baseUrl = this.configService.get<string>('OLLAMA_BASE_URL') ?? 'http://host.docker.internal:11434'
      const model = this.configService.get<string>('OLLAMA_MODEL') ?? 'tinyllama'
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: true,
          messages: [
            { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
            ...messages,
          ],
        }),
      })

      if (!response.ok || !response.body) {
        yield* this.mockChatStream(messages)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            const parsed = JSON.parse(trimmed) as { done?: boolean; message?: { content?: unknown } }
            if (parsed.done) return
            if (typeof parsed.message?.content === 'string') yield parsed.message.content
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch {
      yield* this.mockChatStream(messages)
    }
  }

  private async *mockChatStream(messages: { role: 'user' | 'assistant'; content: string }[]) {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content.toLowerCase() ?? ''
    const answer = this.buildMockChatAnswer(lastUserMessage)

    for (const chunk of answer.match(/.{1,80}(\s|$)/g) ?? [answer]) {
      yield chunk
    }
  }

  private buildMockChatAnswer(message: string): string {
    if (message.includes('etudiant') || message.includes('student')) {
      return 'Pour un etudiant, je regarderais en priorite Imagine R. Combien de jours par semaine utilisez-vous les transports ?'
    }

    if (message.includes('senior') || message.includes('retraite') || message.includes('62')) {
      return 'Pour une personne de 62 ans ou plus, Navigo Senior peut etre adapte. Utilisez-vous les transports presque tous les jours ?'
    }

    if (message.includes('travail') || message.includes('salarie') || message.includes('bureau')) {
      return 'Pour des trajets domicile-travail reguliers, Navigo Annuel est souvent le plus simple. Vous deplacez-vous au moins 4 jours par semaine ?'
    }

    return 'Bonjour, je suis l assistant Comutitres en mode test. Je peux vous aider a choisir un abonnement. Quelle est votre situation : etudiant, salarie, senior ou usage occasionnel ?'
  }

  private pickMockOffer(dto: RecommendDto, offerIds: string[]): string {
    const preferredByProfile: Record<string, string[]> = {
      employee: ['navigo_annuel', 'navigo_mois'],
      student: ['imagine_r_etudiant', 'imagine_r'],
      junior_school: ['imagine_r_junior', 'imagine_r'],
      school: ['imagine_r_scolaire', 'imagine_r'],
      senior: ['navigo_senior'],
      tst: ['tst'],
      amethyste: ['amethyste'],
    }

    const candidates = preferredByProfile[dto.profile] ?? []
    return candidates.find((id) => offerIds.includes(id)) ?? offerIds[0] ?? ''
  }
}
