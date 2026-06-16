import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ children, className = '', variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button className={`button button--${variant} button--${size} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
