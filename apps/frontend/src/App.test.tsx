import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import i18n from './lib/i18n'
import { App } from './App'

describe('App', () => {
  beforeAll(async () => {
    // jsdom does not implement matchMedia, which useTheme requires.
    vi.spyOn(window, 'matchMedia').mockImplementation((q) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    // Force French for deterministic rendered text.
    await i18n.changeLanguage('fr')
  })

  it('renders the landing CTA after route resolves', async () => {
    render(<App />)
    // Suspense fallback first, then content lazy-loads
    const ctas = await screen.findAllByText(i18n.t('hero.ctaPrimary'))
    expect(ctas.length).toBeGreaterThan(0)
  })
})
