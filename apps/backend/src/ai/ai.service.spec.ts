import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: '[RECOMMENDATION]\nofferId: does-not-exist\nreason: test fallback\n[/RECOMMENDATION]',
          },
        ],
      }),
      stream: vi.fn(),
    },
  })),
}))

describe('AiService.recommend', () => {
  it('falls back to the first matching offer when Claude returns an unknown offerId', async () => {
    const offersService = {
      findAll: vi.fn().mockResolvedValue([{ id: 'navigo_mois', name: 'Navigo Mois', profiles: ['employee'] }]),
    } as never

    const { AiService } = await import('./ai.service')
    const service = new AiService(new ConfigService({ ANTHROPIC_API_KEY: 'sk-ant-test' }), offersService)

    const result = await service.recommend({
      profile: 'employee',
      daysPerWeek: 5,
      tripsPerDay: 2,
      zones: 2,
    })

    expect(result.offerId).toBe('navigo_mois')
    expect(result.reason).toBe('test fallback')
  })
})
