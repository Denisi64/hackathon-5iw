import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, Info, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useNotifications } from '../../hooks/useNotifications'
import type { NotificationLevel } from '../../utils/notifications'

const LEVEL_ICON: Record<NotificationLevel, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
}
const LEVEL_COLOR: Record<NotificationLevel, string> = {
  info: 'text-accent',
  warning: 'text-amber-600 dark:text-amber-400',
  success: 'text-emerald-600 dark:text-emerald-400',
}

export function NotificationBell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notifications, count, dismiss } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fermeture au clic extérieur et sur Échap.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('notifications.ariaLabel')}
        aria-expanded={open}
        className={cn(
          'relative grid h-9 w-9 place-items-center rounded-lg bg-surface border border-border-default text-fg-muted',
          'transition-colors duration-200 hover:bg-surface-hover hover:text-fg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        )}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('notifications.title')}
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border-default bg-bg-elevated shadow-card-hover"
        >
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight text-fg">{t('notifications.title')}</h2>
            {count > 0 && (
              <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{count}</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-fg-muted">{t('notifications.empty')}</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-border-default overflow-y-auto">
              {notifications.map((n) => {
                const Icon = LEVEL_ICON[n.level]
                return (
                  <li key={n.id} className="flex gap-3 px-4 py-3">
                    <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', LEVEL_COLOR[n.level])} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-fg">{t(n.titleKey)}</p>
                      <p className="mt-0.5 text-sm text-fg-muted">{t(n.messageKey, n.messageParams)}</p>
                      {n.ctaKey && n.ctaTo && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false)
                            navigate(n.ctaTo!)
                          }}
                          className="mt-2 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base rounded-sm"
                        >
                          {t(n.ctaKey)}
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => dismiss(n.id)}
                      aria-label={t('notifications.dismiss')}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
