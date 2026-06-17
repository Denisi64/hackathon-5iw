import { forwardRef, useRef, type HTMLAttributes, type MouseEvent } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'default' | 'glass' | 'feature'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  hover?: boolean
  spotlight?: boolean
}

const variants: Record<Variant, string> = {
  default:
    'bg-bg-elevated dark:bg-gradient-to-b dark:from-white/[0.04] dark:to-white/[0.01] p-6',
  glass:
    'bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl p-6',
  feature:
    'bg-bg-elevated dark:bg-gradient-to-b dark:from-white/[0.06] dark:to-white/[0.02] p-8',
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover, spotlight, className, children, onMouseMove, ...rest }, ref) => {
    const localRef = useRef<HTMLDivElement | null>(null)

    const setRef = (node: HTMLDivElement | null) => {
      localRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    }

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (spotlight && localRef.current) {
        const rect = localRef.current.getBoundingClientRect()
        localRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`)
        localRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`)
      }
      onMouseMove?.(e)
    }

    return (
      <div
        ref={setRef}
        onMouseMove={handleMouseMove}
        className={cn(
          'group/card relative overflow-hidden rounded-2xl text-fg shadow-card',
          'border border-border-default',
          'transition-[transform,box-shadow,border-color] duration-300',
          variants[variant],
          hover && 'hover:-translate-y-1 hover:shadow-card-hover hover:border-border-hover',
          className,
        )}
        {...rest}
      >
        {/* Top edge inner highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px
                     bg-gradient-to-r from-transparent via-border-accent to-transparent"
        />
        {/* Mouse-tracking spotlight (only when spotlight=true) */}
        {spotlight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
            style={{
              background:
                'radial-gradient(300px circle at var(--mx,50%) var(--my,50%), rgba(var(--spotlight-rgb), 0.15), transparent 70%)',
            }}
          />
        )}
        <div className="relative z-10 flex h-full flex-col">{children}</div>
      </div>
    )
  },
)
CardRoot.displayName = 'Card'

const Header = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex items-center justify-between gap-3', className)} {...rest} />
)
const Body = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1', className)} {...rest} />
)
const Footer = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 flex items-center justify-between gap-3', className)} {...rest} />
)

export const Card = Object.assign(CardRoot, { Header, Body, Footer })
