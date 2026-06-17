import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mx-auto mt-32 w-[min(100%-1.5rem,1200px)] pb-10">
      {/* Top divider gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-border-default to-transparent" />
      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <p className="font-semibold tracking-tight text-fg">Comutitres</p>
        <p className="text-xs text-fg-muted">{t('footer.tagline')}</p>
        <ul className="mt-2 flex flex-wrap justify-center gap-6 text-xs text-fg-muted">
          <li><a href="#" className="transition-colors hover:text-fg">{t('footer.links.rgpd')}</a></li>
          <li><a href="#" className="transition-colors hover:text-fg">{t('footer.links.legal')}</a></li>
          <li><a href="#" className="transition-colors hover:text-fg">{t('footer.links.contact')}</a></li>
        </ul>
      </div>
    </footer>
  )
}
