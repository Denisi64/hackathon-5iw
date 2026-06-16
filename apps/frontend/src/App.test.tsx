import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the Comutitres product experience', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Comutitres')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: /abonnement de transport/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /comparer les abonnements/i })).toBeInTheDocument()
  })
})
