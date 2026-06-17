import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><div>content</div></Card>)
    expect(screen.getByText('content')).toBeInTheDocument()
  })
  it('renders compound sub-components', () => {
    render(
      <Card>
        <Card.Header>H</Card.Header>
        <Card.Body>B</Card.Body>
        <Card.Footer>F</Card.Footer>
      </Card>,
    )
    expect(screen.getByText('H')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('F')).toBeInTheDocument()
  })
})
