import { NotFoundException } from '@nestjs/common'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { UsersService } from './users.service'
import { db } from '../db'

vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  firstName: 'Alice',
  lastName: 'Dupont',
  profile: 'student' as const,
  role: 'user' as const,
  language: 'fr',
  gdprConsent: false,
  createdAt: new Date(),
}

function mockSelectChain(result: unknown[]) {
  const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
  mockDb.select.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(result),
        orderBy: vi.fn().mockResolvedValue(result),
      }),
      orderBy: vi.fn().mockResolvedValue(result),
      innerJoin: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(result),
      }),
    }),
  })
}

describe('UsersService', () => {
  let service: UsersService

  beforeEach(() => {
    service = new UsersService()
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockSelectChain([])
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException)
    })

    it('returns user data without password hash', async () => {
      mockSelectChain([mockUser])
      const result = await service.findById('user-1')
      expect(result.email).toBe('test@test.com')
      expect(result).not.toHaveProperty('passwordHash')
    })
  })

  describe('update', () => {
    it('throws NotFoundException when user does not exist', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      await expect(service.update('unknown', { firstName: 'Bob' })).rejects.toThrow(NotFoundException)
    })

    it('returns updated user', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: 'user-1', email: 'test@test.com', firstName: 'Bob', lastName: 'Dupont' }]),
          }),
        }),
      })

      const result = await service.update('user-1', { firstName: 'Bob' })
      expect(result.firstName).toBe('Bob')
    })
  })

  describe('getNotifications', () => {
    it('returns notifications for user', async () => {
      const notifications = [
        { id: 'notif-1', userId: 'user-1', type: 'renewal', message: 'Abonnement expire bientot', readAt: null, createdAt: new Date() },
      ]
      mockSelectChain(notifications)
      const result = await service.getNotifications('user-1')
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('renewal')
    })

    it('returns empty array when no notifications', async () => {
      mockSelectChain([])
      const result = await service.getNotifications('user-1')
      expect(result).toHaveLength(0)
    })
  })

  describe('saveConsent', () => {
    it('inserts consent record and returns it', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      const consentRecord = { id: 'consent-1', userId: 'user-1', type: 'rgpd', accepted: true, acceptedAt: new Date() }
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([consentRecord]),
        }),
      })
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await service.saveConsent('user-1', 'rgpd', true)
      expect(result.type).toBe('rgpd')
      expect(result.accepted).toBe(true)
    })
  })

  describe('deleteAccount', () => {
    it('anonymises user data for RGPD compliance', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })

      const result = await service.deleteAccount('user-1')
      expect(result.message).toContain('RGPD')
    })
  })
})
