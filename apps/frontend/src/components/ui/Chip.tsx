import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: ReactNode
  size?: 'sm' | 'md'
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ active, icon, size = 'md', children, className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-medium tracking-tight border',
        'transition-[background-color,border-color,color,transform] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        sizes[size],
        active
          ? 'bg-accent text-white border-accent shadow-button hover:bg-accent-bright'
          : 'bg-surface text-fg border-border-default hover:border-border-hover hover:bg-surface-hover',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  ),
)
Chip.displayName = 'Chip'
