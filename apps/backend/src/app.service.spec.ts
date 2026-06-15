import { describe, expect, it } from 'vitest'
import { AppService } from './app.service'

describe('AppService', () => {
  it('returns a healthy status', () => {
    const health = new AppService().health()

    expect(health.status).toBe('ok')
    expect(health.service).toBe('comutitres-backend')
    expect(health.timestamp).toBeTruthy()
  })
})
