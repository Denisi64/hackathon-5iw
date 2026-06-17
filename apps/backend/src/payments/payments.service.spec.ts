import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { PaymentsService } from './payments.service'
import { db } from '../db'

const mockCheckoutCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test', id: 'cs_test_123' })
const mockConstructEvent = vi.fn()

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockCheckoutCreate } },
    webhooks: { constructEvent: mockConstructEvent },
  })),
}))

vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}))

const mockConfigService = {
  get: vi.fn().mockImplementation((key: string) => {
    if (key === 'FRONTEND_URL') return 'http://localhost:5173'
    return 'test_secret'
  }),
} as unknown as ConfigService

function mockSelect(results: unknown[][]) {
  let callCount = 0
  const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
  mockDb.select.mockImplementation(() => ({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(results[callCount++] ?? []),
      }),
    }),
  }))
}

describe('PaymentsService', () => {
  let service: PaymentsService

  beforeEach(() => {
    service = new PaymentsService(mockConfigService)
    vi.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    it('throws NotFoundException if subscription not found', async () => {
      mockSelect([[]])
      await expect(service.createCheckoutSession('unknown')).rejects.toThrow(NotFoundException)
    })

    it('throws NotFoundException if offer not found', async () => {
      mockSelect([[{ id: 'sub-1', offerId: 'navigo_mois', status: 'pending_payment' }], []])
      await expect(service.createCheckoutSession('sub-1')).rejects.toThrow(NotFoundException)
    })

    it('returns a Stripe URL and sessionId', async () => {
      mockSelect([
        [{ id: 'sub-1', offerId: 'navigo_mois', status: 'pending_payment' }],
        [{ id: 'navigo_mois', name: 'Navigo Mensuel', monthlyPrice: 8660, description: null }],
      ])

      const result = await service.createCheckoutSession('sub-1')
      expect(result.url).toBe('https://checkout.stripe.com/test')
      expect(result.sessionId).toBe('cs_test_123')
      expect(mockCheckoutCreate).toHaveBeenCalledOnce()
    })
  })

  describe('handleWebhook', () => {
    it('throws if Stripe signature is invalid', async () => {
      mockConstructEvent.mockImplementation(() => { throw new Error('Bad signature') })
      await expect(
        service.handleWebhook(Buffer.from('body'), 'bad_sig'),
      ).rejects.toThrow('Webhook signature invalide')
    })

    it('sets subscription to active on checkout.session.completed', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { subscriptionId: 'sub-1' },
            customer: 'cus_test_123',
          },
        },
      })

      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await service.handleWebhook(Buffer.from('body'), 'valid_sig')
      expect(result).toEqual({ received: true })
      expect(mockDb.update).toHaveBeenCalled()
    })

    it('ignores unhandled Stripe events', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.created',
        data: { object: {} },
      })

      const result = await service.handleWebhook(Buffer.from('body'), 'valid_sig')
      expect(result).toEqual({ received: true })
    })
  })
})
