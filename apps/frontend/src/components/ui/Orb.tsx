import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Color = 'primary' | 'pink' | 'purple' | 'green' | 'amber'
type Size = 'md' | 'lg'

export interface OrbProps {
  value: ReactNode
  label: string
  color?: Color
  size?: Size
  className?: string
}

const sizes: Record<Size, string> = {
  md: 'h-24 w-24 text-2xl',
  lg: 'h-32 w-32 text-3xl',
}

const colors: Record<Color, string> = {
  primary:
    'bg-gradient-to-br from-accent-bright to-accent text-white shadow-[0_0_40px_rgba(var(--spotlight-rgb),0.35)]',
  pink:
    'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-[0_0_40px_rgba(236,72,153,0.35)]',
  purple:
    'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-[0_0_40px_rgba(168,85,247,0.35)]',
  green:
    'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.35)]',
  amber:
    'bg-gradient-to-br from-amber-300 to-amber-500 text-fg shadow-[0_0_40px_rgba(245,158,11,0.35)]',
}

export function Orb({ value, label, color = 'primary', size = 'md', className }: OrbProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-semibold tracking-tight',
          'border border-white/20 transition-transform duration-300 hover:scale-105',
          sizes[size],
          colors[color],
        )}
      >
        {value}
      </div>
      <span className="text-center text-xs font-medium text-fg-muted max-w-[10rem]">{label}</span>
    </div>
  )
}
