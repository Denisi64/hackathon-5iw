import { Sun, Moon, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/cn'

const ICONS = { light: Sun, dark: Moon, system: Monitor } as const
const NEXT = { light: 'dark', dark: 'system', system: 'light' } as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycle } = useTheme()
  const { t } = useTranslation()
  const Icon = ICONS[theme]
  const nextTheme = NEXT[theme]
  const labelKey = nextTheme === 'light' ? 'themeToggle.toLight'
                 : nextTheme === 'dark' ? 'themeToggle.toDark'
                 : 'themeToggle.toSystem'

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={t(labelKey)}
      className={cn(
        'h-9 w-9 grid place-items-center rounded-lg bg-surface border border-border-default text-fg-muted',
        'transition-[background-color,border-color,color] duration-200',
        'hover:bg-surface-hover hover:border-border-hover hover:text-fg',
        'active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}
