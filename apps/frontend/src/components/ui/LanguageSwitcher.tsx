import { useEffect, useRef, useState } from 'react'
import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocale } from '../../hooks/useLocale'
import { LOCALE_META, SUPPORTED_LOCALES, type Locale } from '../../lib/i18n'
import { cn } from '../../lib/cn'

export interface LanguageSwitcherProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function LanguageSwitcher({ variant = 'compact', className }: LanguageSwitcherProps) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const meta = LOCALE_META[locale]

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('languageSwitcher.label')}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'h-9 inline-flex items-center gap-2 rounded-lg bg-surface border border-border-default text-fg-muted px-2.5',
          'transition-[background-color,border-color,color] duration-200',
          'hover:bg-surface-hover hover:border-border-hover hover:text-fg',
          'active:scale-[0.97]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        )}
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm leading-none" aria-hidden="true">{meta.flag}</span>
        {variant === 'full' && <span className="text-sm font-medium">{meta.name}</span>}
      </button>

      {open && (
        <ul
          role="menu"
          className={cn(
            'absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-bg-elevated border border-border-default p-1.5 shadow-card-hover z-50',
            'backdrop-blur-xl',
          )}
        >
          {SUPPORTED_LOCALES.map((code) => {
            const m = LOCALE_META[code as Locale]
            const isActive = code === locale
            return (
              <li key={code}>
                <button
                  role="menuitemradio"
                  aria-checked={isActive}
                  type="button"
                  onClick={async () => { await setLocale(code as Locale); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                    'hover:bg-surface-hover',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                    isActive ? 'bg-surface text-fg' : 'text-fg-muted',
                  )}
                >
                  <span aria-hidden="true" className="text-base">{m.flag}</span>
                  <span className="flex-1 text-sm">{m.name}</span>
                  {isActive && <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
