import { NotFoundException } from '@nestjs/common'
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
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    }),
  },
}))

describe('SubscriptionsService', () => {
  const user = { sub: 'user-dev-a', email: 'dev-a@comutitres.local', role: 'payer' }

  it('throws NotFoundException for an unknown subscription id', async () => {
    const { SubscriptionsService } = await import('./subscriptions.service')
    const service = new SubscriptionsService()
    await expect(service.findOneForUser(user, '00000000-0000-0000-0000-000000000000')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('throws NotFoundException when creating with an unknown offer id', async () => {
    const { SubscriptionsService } = await import('./subscriptions.service')
    const service = new SubscriptionsService()
    await expect(service.create(user, { offerId: 'unknown-offer' })).rejects.toThrow(NotFoundException)
  })
})
