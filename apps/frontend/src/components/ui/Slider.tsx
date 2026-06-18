import { useId, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '../../lib/cn'

export interface SliderProps {
  label: string
  min: number
  max: number
  step?: number
  value: number
  unit?: string
  onChange: (v: number) => void
  className?: string
}

export function Slider({ label, min, max, step = 1, value, unit, onChange, className }: SliderProps) {
  const id = useId()
  const trackRef = useRef<HTMLDivElement>(null)
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const pct = ((value - min) / (max - min)) * 100
  const valueText = unit ? `${value} ${unit}` : String(value)

  // Convertit une position horizontale (px) en valeur arrondie au pas.
  const valueFromClientX = (clientX: number): number => {
    const el = trackRef.current
    if (!el) return value
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return value
    const ratio = (clientX - rect.left) / rect.width
    const stepped = Math.round((min + ratio * (max - min)) / step) * step
    return clamp(stepped)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const next = valueFromClientX(e.clientX)
    if (next !== value) onChange(next)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    // Seulement pendant le glissement (bouton enfoncé / pointeur capturé).
    if (e.buttons === 0) return
    const next = valueFromClientX(e.clientX)
    if (next !== value) onChange(next)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, Math.round((max - min) / 10))
    let next = value
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = clamp(value + step); break
      case 'ArrowLeft':
      case 'ArrowDown':
        next = clamp(value - step); break
      case 'PageUp':
        next = clamp(value + big); break
      case 'PageDown':
        next = clamp(value - big); break
      case 'Home':
        next = min; break
      case 'End':
        next = max; break
      default:
        return
    }
    e.preventDefault()
    if (next !== value) onChange(next)
  }

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-medium tracking-wide text-fg-muted uppercase">
          {label}
        </label>
        <span className="font-mono text-sm font-medium text-fg tabular-nums">{valueText}</span>
      </div>
      <div
        ref={trackRef}
        id={id}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative h-6 cursor-pointer touch-none select-none rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
      >
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1.5 rounded-full bg-surface border border-border-default" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1.5 rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg-elevated border border-border-hover shadow-card transition-transform duration-200 hover:scale-110"
          style={{ left: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
