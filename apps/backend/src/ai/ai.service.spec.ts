import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AiService } from './ai.service'
import { db } from '../db'

const mockMessagesCreate = vi.fn()
const mockMessagesStream = vi.fn()

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockMessagesCreate,
      stream: mockMessagesStream,
    },
  })),
}))

vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
  },
}))

const mockConfigService = {
  get: vi.fn().mockReturnValue('test_key'),
} as unknown as ConfigService

describe('AiService', () => {
  let service: AiService

  beforeEach(() => {
    service = new AiService(mockConfigService)
    vi.clearAllMocks()
  })

  describe('recommend', () => {
    it('returns a valid offer from active offers', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: 'navigo_mois' },
            { id: 'imagine_r_etudiant' },
          ]),
        }),
      })

      mockMessagesCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'offerId: imagine_r_etudiant\nreason: Best student rate' }],
      })

      const result = await service.recommend({ profile: 'student', age: 21, scholarship: false, daysPerWeek: 5, tripsPerDay: 2, zones: 3 })
      expect(result.offerId).toBe('imagine_r_etudiant')
      expect(result.reason).toBeTruthy()
    })

    it('falls back to first active offer if Claude returns invalid ID', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 'navigo_mois' }]),
        }),
      })

      mockMessagesCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'offerId: non_existent_id\nreason: test' }],
      })

      const result = await service.recommend({ profile: 'worker', daysPerWeek: 5, tripsPerDay: 2, zones: 3 })
      expect(result.offerId).toBe('navigo_mois')
    })
  })

  describe('verifyDocument', () => {
    it('parses and returns JSON from Claude Vision', async () => {
      const payload = { valid: true, documentType: 'certificat_scolarite', confidence: 92, expiresAt: '2025-06-30' }
      mockMessagesCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(payload) }],
      })

      const result = await service.verifyDocument('base64data', 'image/jpeg')
      expect(result).toMatchObject({ valid: true, confidence: 92 })
    })

    it('throws if Claude does not return valid JSON', async () => {
      mockMessagesCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Not a JSON response' }],
      })

      await expect(service.verifyDocument('base64data', 'image/png')).rejects.toThrow()
    })
  })

  describe('chatStream', () => {
    it('yields text chunks from the stream', async () => {
      const fakeChunks = [
        { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Bonjour' } },
        { type: 'content_block_delta', delta: { type: 'text_delta', text: ' !' } },
        { type: 'message_stop' },
      ]

      async function* fakeStream() {
        for (const chunk of fakeChunks) yield chunk
      }

      mockMessagesStream.mockReturnValue(fakeStream())

      const collected: string[] = []
      for await (const chunk of service.chatStream([{ role: 'user', content: 'Hello' }])) {
        collected.push(chunk)
      }

      expect(collected).toEqual(['Bonjour', ' !'])
    })
  })
})
