import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import i18n from './lib/i18n'
import { App } from './App'

describe('App', () => {
  beforeAll(async () => {
    // jsdom n'implémente pas matchMedia, requis par useTheme
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
    // Force la locale FR pour un snapshot déterministe
    await i18n.changeLanguage('fr')
  })

  it('renders the landing CTA after route resolves', async () => {
    render(<App />)
    // Suspense fallback first, then content lazy-loads
    const ctas = await screen.findAllByText('Lancer le simulateur')
    expect(ctas.length).toBeGreaterThan(0)
  })
})
