import { NotFoundException } from '@nestjs/common'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { OffersService } from './offers.service'
import { db } from '../db'

vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
  },
}))

describe('OffersService', () => {
  let offersService: OffersService

  beforeEach(() => {
    offersService = new OffersService()
    vi.clearAllMocks()
  })

  const mockSelect = (result: unknown[]) => {
    const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(result),
        }),
      }),
    })
  }

  it('findAll retourne la liste des offres actives', async () => {
    const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: 'navigo_annuel', nom: 'Navigo Annuel', actif: true },
        ]),
      }),
    })

    const result = await offersService.findAll()
    expect(result).toHaveLength(1)
  })

  it('findById lève NotFoundException si offre inexistante', async () => {
    mockSelect([])
    await expect(offersService.findById('inexistant')).rejects.toThrow(NotFoundException)
  })

  it('findById retourne l\'offre si elle existe', async () => {
    mockSelect([{ id: 'navigo_annuel', nom: 'Navigo Annuel' }])
    const result = await offersService.findById('navigo_annuel')
    expect(result.id).toBe('navigo_annuel')
  })
})
