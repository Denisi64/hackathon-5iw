import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LOCALES, type Locale } from '../lib/i18n'

function ensureCjkFontLoaded(lang: string) {
  if (lang !== 'ja') return
  if (document.getElementById('font-noto-jp')) return
  const link = document.createElement('link')
  link.id = 'font-noto-jp'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700;800&display=swap'
  document.head.appendChild(link)
}

export function useLocale() {
  const { i18n } = useTranslation()
  const locale = (i18n.language?.slice(0, 2) || 'fr') as Locale

  const setLocale = useCallback(async (next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return
    await i18n.changeLanguage(next)
    try { localStorage.setItem('clay-lang', next) } catch {}
    document.documentElement.lang = next
    ensureCjkFontLoaded(next)
  }, [i18n])

  return { locale, setLocale, supported: SUPPORTED_LOCALES }
}
