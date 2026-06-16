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
  },
}))

describe('OffersService', () => {
  it('throws NotFoundException for an unknown offer id', async () => {
    const { OffersService } = await import('./offers.service')
    const service = new OffersService()
    await expect(service.findOne('does-not-exist')).rejects.toThrow(NotFoundException)
  })
})
