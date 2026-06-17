import { useEffect } from 'react'
import { useThemeStore, type Theme } from '../stores/themeStore'

type Resolved = 'light' | 'dark'

function resolve(theme: Theme): Resolved {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function apply(resolved: Resolved) {
  const html = document.documentElement
  html.setAttribute('data-theme', resolved)
  html.classList.toggle('dark', resolved === 'dark')
  const meta = document.getElementById('meta-theme-color')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#050506' : '#F4F8FE')
}

export function useTheme() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const cycle = useThemeStore((s) => s.cycle)

  useEffect(() => {
    apply(resolve(theme))
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply(resolve('system'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  return { theme, setTheme, cycle, resolved: resolve(theme) }
}
