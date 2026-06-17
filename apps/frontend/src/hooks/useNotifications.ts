import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useLocale } from './useLocale'
import { buildNotifications, type AppNotification } from '../utils/notifications'

const DISMISSED_PREFIX = 'clay-dismissed-notifs-'

function readDismissed(email: string): string[] {
  if (!email) return []
  try {
    const raw = localStorage.getItem(DISMISSED_PREFIX + email)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}
function writeDismissed(email: string, ids: string[]): void {
  if (!email) return
  try {
    localStorage.setItem(DISMISSED_PREFIX + email, JSON.stringify(ids))
  } catch {
    /* stockage indisponible — on ignore */
  }
}

export interface UseNotifications {
  notifications: AppNotification[]
  count: number
  dismiss: (id: string) => void
}

export function useNotifications(): UseNotifications {
  const sub = useAuthStore((s) => s.user?.subscription ?? null)
  const email = useAuthStore((s) => s.user?.email ?? '')
  const { locale } = useLocale()
  const [dismissed, setDismissed] = useState<string[]>(() => readDismissed(email))

  // Recharge la liste ignorée quand on change de compte.
  useEffect(() => {
    setDismissed(readDismissed(email))
  }, [email])

  const all = useMemo(() => buildNotifications(sub, Date.now(), locale), [sub, locale])
  const notifications = useMemo(() => all.filter((n) => !dismissed.includes(n.id)), [all, dismissed])

  const dismiss = useCallback(
    (id: string) => {
      setDismissed((prev) => {
        if (prev.includes(id)) return prev
        const next = [...prev, id]
        writeDismissed(email, next)
        return next
      })
    },
    [email],
  )

  return { notifications, count: notifications.length, dismiss }
}
