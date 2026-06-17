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

  it('findAll returns active offers', async () => {
    const mockDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: 'navigo_annuel', name: 'Navigo Annuel', active: true },
        ]),
      }),
    })

    const result = await offersService.findAll()
    expect(result).toHaveLength(1)
  })

  it('findById throws NotFoundException if offer not found', async () => {
    mockSelect([])
    await expect(offersService.findById('unknown')).rejects.toThrow(NotFoundException)
  })

  it('findById returns the offer if it exists', async () => {
    mockSelect([{ id: 'navigo_annuel', name: 'Navigo Annuel' }])
    const result = await offersService.findById('navigo_annuel')
    expect(result.id).toBe('navigo_annuel')
  })
})
