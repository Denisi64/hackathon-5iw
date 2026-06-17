import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SubscriptionsService } from './subscriptions.service'
import { db } from '../db'

vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

const mockFraudScoreService = { compute: vi.fn().mockResolvedValue(undefined) }

const mockSub = { id: 'sub-1', payerId: 'user-1', offerId: 'navigo_mois', status: 'draft' as const, holderId: null }

function mockSelect(result: unknown[]) {
  const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
  mockDb.select.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(result),
      }),
    }),
  })
}

describe('SubscriptionsService', () => {
  let service: SubscriptionsService

  beforeEach(() => {
    service = new SubscriptionsService(mockFraudScoreService as never)
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('creates a subscription with draft status', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSub]),
        }),
      })

      const result = await service.create('user-1', { offerId: 'navigo_mois' })
      expect(result.status).toBe('draft')
      expect(result.id).toBe('sub-1')
    })

    it('creates a subscription with holder info', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...mockSub, holderLastName: 'Dupont', holderFirstName: 'Emma' }]),
        }),
      })

      const result = await service.create('user-1', {
        offerId: 'imagine_r_scolaire',
        holderLastName: 'Dupont',
        holderFirstName: 'Emma',
        holderDateOfBirth: '2010-05-01',
      })

      expect(result.holderLastName).toBe('Dupont')
    })
  })

  describe('findById', () => {
    it('throws NotFoundException if subscription not found', async () => {
      mockSelect([])
      await expect(service.findById('unknown', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('throws ForbiddenException if subscription belongs to another user', async () => {
      mockSelect([{ ...mockSub, payerId: 'other-user' }])
      await expect(service.findById('sub-1', 'user-1')).rejects.toThrow(ForbiddenException)
    })

    it('returns the subscription when it belongs to the user', async () => {
      mockSelect([mockSub])
      const result = await service.findById('sub-1', 'user-1')
      expect(result.id).toBe('sub-1')
    })
  })

  describe('confirm', () => {
    it('sets status to pending_payment and triggers fraud score', async () => {
      mockSelect([mockSub])
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...mockSub, status: 'pending_payment' }]),
          }),
        }),
      })

      const result = await service.confirm('sub-1', 'user-1')
      expect(result.status).toBe('pending_payment')
      expect(mockFraudScoreService.compute).toHaveBeenCalledWith('sub-1')
    })

    it('throws NotFoundException if subscription not found', async () => {
      mockSelect([])
      await expect(service.confirm('unknown', 'user-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('renew', () => {
    it('creates a new draft subscription from existing one', async () => {
      mockSelect([mockSub])
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...mockSub, id: 'sub-2', status: 'draft' }]),
        }),
      })

      const result = await service.renew('sub-1', 'user-1')
      expect(result.id).toBe('sub-2')
      expect(result.status).toBe('draft')
    })
  })
})
