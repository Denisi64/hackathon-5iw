import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Hit</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
  it('is disabled when loading', () => {
    render(<Button loading>Wait</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
