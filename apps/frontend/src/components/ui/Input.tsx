import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftAddon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftAddon, id, className, ...rest }, ref) => {
    const autoId = useId()
    const inputId = id ?? autoId
    const messageId = error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium tracking-wide text-fg-muted">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <span className="absolute left-3 text-fg-subtle" aria-hidden="true">{leftAddon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={messageId}
            aria-invalid={error ? true : undefined}
            className={cn(
              'h-11 w-full rounded-lg border border-border-default bg-bg-elevated',
              'px-4 py-2 text-sm text-fg placeholder:text-fg-subtle',
              'transition-[border-color,box-shadow,background-color] duration-200',
              'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40',
              leftAddon && 'pl-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30',
              className,
            )}
            {...rest}
          />
        </div>
        {error && (
          <span id={messageId} role="alert" className="text-xs font-medium text-rose-500">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={messageId} className="text-xs text-fg-muted">{helperText}</span>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'
