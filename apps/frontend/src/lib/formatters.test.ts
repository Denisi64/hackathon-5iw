import { describe, expect, it } from 'vitest'
import { formatCurrency } from './formatters'

describe('formatCurrency', () => {
  it('formats EUR for fr', () => {
    expect(formatCurrency(902.40, 'fr')).toMatch(/902,40\s?€/)
  })
  it('formats EUR for en (en-GB)', () => {
    expect(formatCurrency(902.40, 'en')).toMatch(/€902\.40/)
  })
  it('formats EUR for ja with no decimals', () => {
    const out = formatCurrency(902.40, 'ja')
    expect(out).toContain('902')
    expect(out).not.toMatch(/\./)
  })
  it('falls back to fr for unknown locale', () => {
    expect(formatCurrency(100, 'xx' as never)).toMatch(/100,00\s?€/)
  })
})
