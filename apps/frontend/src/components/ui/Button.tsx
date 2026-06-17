import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight ' +
  'transition-[transform,box-shadow,background-color,color,border-color] duration-200 select-none whitespace-nowrap overflow-hidden ' +
  'disabled:opacity-50 disabled:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base ' +
  'active:scale-[0.98]'

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
}

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-white shadow-button hover:bg-accent-bright hover:shadow-button-hover',
  secondary:
    'bg-surface text-fg shadow-inner hover:bg-surface-hover',
  outline:
    'bg-transparent text-fg border border-border-default hover:border-border-hover hover:bg-surface',
  ghost:
    'bg-transparent text-fg-muted hover:bg-surface hover:text-fg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, fullWidth, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
      {...rest}
    >
      {/* Shine sweep — visible only on primary variant via tw-merge override */}
      {variant === 'primary' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full
                     transition-transform duration-700 ease-out
                     bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}
      <span className="relative inline-flex items-center gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
        <span>{children}</span>
        {rightIcon}
      </span>
    </button>
  ),
)
Button.displayName = 'Button'
