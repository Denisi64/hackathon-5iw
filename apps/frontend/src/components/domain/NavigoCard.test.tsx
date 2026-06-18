import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavigoCard } from './NavigoCard'

describe('NavigoCard', () => {
  it('affiche le titulaire et le forfait', () => {
    render(<NavigoCard offerName="Navigo Annuel" firstName="Lucas" lastName="Martin" endDate="2026-12-31" />)
    expect(screen.getByText('Navigo Annuel')).toBeInTheDocument()
    expect(screen.getByText(/Lucas Martin/i)).toBeInTheDocument()
  })

  it('utilise un libellé de repli quand le forfait est absent', () => {
    render(<NavigoCard offerName={null} firstName="A" lastName="B" endDate={null} />)
    // « Navigo » apparaît en en-tête de carte ET comme libellé de repli du forfait absent.
    expect(screen.getAllByText('Navigo')).toHaveLength(2)
  })
})
