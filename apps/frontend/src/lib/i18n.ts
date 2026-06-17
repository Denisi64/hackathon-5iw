import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import fr from '../locales/fr/common.json'
import en from '../locales/en/common.json'
import es from '../locales/es/common.json'
import it from '../locales/it/common.json'
import ja from '../locales/ja/common.json'
import pt from '../locales/pt/common.json'

export const SUPPORTED_LOCALES = ['fr', 'en', 'es', 'it', 'ja', 'pt'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_META: Record<Locale, { name: string; flag: string; intl: string }> = {
  fr: { name: 'Français', flag: '🇫🇷', intl: 'fr-FR' },
  en: { name: 'English', flag: '🇬🇧', intl: 'en-GB' },
  es: { name: 'Español', flag: '🇪🇸', intl: 'es-ES' },
  it: { name: 'Italiano', flag: '🇮🇹', intl: 'it-IT' },
  ja: { name: '日本語', flag: '🇯🇵', intl: 'ja-JP' },
  pt: { name: 'Português', flag: '🇵🇹', intl: 'pt-PT' },
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: fr },
      en: { common: en },
      es: { common: es },
      it: { common: it },
      ja: { common: ja },
      pt: { common: pt },
    },
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    nonExplicitSupportedLngs: true,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'clay-lang',
      caches: ['localStorage'],
    },
  })

export default i18n
