import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Slider } from './Slider'

describe('Slider', () => {
  it('renders with aria-valuetext', () => {
    render(<Slider label="Days" value={3} min={1} max={7} onChange={() => {}} unit="d/wk" />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '3')
    expect(slider).toHaveAttribute('aria-valuetext', '3 d/wk')
  })

  it('increments on ArrowRight', () => {
    const onChange = vi.fn()
    render(<Slider label="Days" value={3} min={1} max={7} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('clamps at max with End', () => {
    const onChange = vi.fn()
    render(<Slider label="Days" value={3} min={1} max={7} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    expect(onChange).toHaveBeenCalledWith(7)
  })

  it('does not go below min with ArrowLeft', () => {
    const onChange = vi.fn()
    render(<Slider label="Days" value={1} min={1} max={7} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' })
    expect(onChange).not.toHaveBeenCalled()
  })
})
