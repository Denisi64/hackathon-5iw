import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('associates label with input', () => {
    render(<Input label="Age" id="age" />)
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
  })
  it('renders error message with role=alert', () => {
    render(<Input label="Age" id="age" error="Required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })
})
