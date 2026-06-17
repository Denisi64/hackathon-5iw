import { type HTMLAttributes, type ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/cn'

type Variant = 'recommended' | 'success' | 'warning' | 'info' | 'neutral'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  recommended:
    'bg-accent/15 text-accent border-border-accent',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  info: 'bg-accent/12 text-accent border-border-accent',
  neutral: 'bg-surface text-fg-muted border-border-default',
}

export function Badge({ variant = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {variant === 'recommended' && !icon && <Sparkles className="h-3 w-3" aria-hidden="true" />}
      {icon}
      {children}
    </span>
  )
}
