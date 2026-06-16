import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve([]),
      }),
    }),
  },
}))

describe('PaymentsService', () => {
  it('throws NotFoundException for an unknown subscription id', async () => {
    const { PaymentsService } = await import('./payments.service')
    const service = new PaymentsService(new ConfigService({ STRIPE_SECRET_KEY: 'sk_test_dummy' }))
    await expect(service.createCheckoutSession('00000000-0000-0000-0000-000000000000')).rejects.toThrow(
      NotFoundException,
    )
  })
})
