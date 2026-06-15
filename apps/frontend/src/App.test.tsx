import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the Comutitres bootstrap screen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'ok',
              service: 'comutitres-backend',
              timestamp: new Date().toISOString(),
            }),
        }),
      ),
    )

    render(<App />)

    expect(screen.getByText('Comutitres')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /socle hackathon/i })).toBeInTheDocument()
    expect(await screen.findByText('Dernier healthcheck:', { exact: false })).toBeInTheDocument()
  })
})
