import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthService } from './auth.service'
import * as bcrypt from 'bcryptjs'
import { db } from '../db'

vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn(),
}))

const mockJwtService = { sign: vi.fn().mockReturnValue('mock_token') } as unknown as JwtService
const mockConfigService = { get: vi.fn().mockReturnValue('secret') } as unknown as ConfigService

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService(mockJwtService, mockConfigService)
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('lève ConflictException si email déjà utilisé', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'existing-id' }]),
          }),
        }),
      })

      await expect(
        authService.register({ email: 'test@test.com', password: 'password', firstName: 'A', lastName: 'B' }),
      ).rejects.toThrow(ConflictException)
    })

    it('crée un utilisateur et retourne des tokens', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'new-id', email: 'test@test.com', role: 'user',
          }]),
        }),
      })

      const result = await authService.register({
        email: 'test@test.com', password: 'password', firstName: 'A', lastName: 'B',
      })

      expect(result).toHaveProperty('access_token')
      expect(result).toHaveProperty('refresh_token')
    })
  })

  describe('login', () => {
    it('lève UnauthorizedException si utilisateur introuvable', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(
        authService.login({ email: 'notfound@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('lève UnauthorizedException si mot de passe incorrect', async () => {
      const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: '1', email: 'test@test.com', passwordHash: 'hash', role: 'user' }]),
          }),
        }),
      })
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })
})
