import { LOCALE_META, type Locale } from './i18n'

export function formatCurrency(amount: number, locale: Locale | string): string {
  const meta = LOCALE_META[locale as Locale] ?? LOCALE_META.fr
  const fractionDigits = locale === 'ja' ? 0 : 2
  return new Intl.NumberFormat(meta.intl, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}
