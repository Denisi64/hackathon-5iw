import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, Menu, X } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { useAuthStore } from '../../stores/authStore'
// Logo couleur unique : sa palette IDFM (bleu pastel + anthracite) tient sur clair ET sombre.
import logo from '../../assets/logos/comutitres-couleur.svg'
import { cn } from '../../lib/cn'

export function Header() {
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <header className="sticky top-3 z-40 mx-auto w-[min(100%-1.5rem,1200px)]">
      <nav
        className={cn(
          'flex h-16 items-center justify-between gap-4 rounded-2xl pl-4 pr-3',
          'bg-bg-elevated/80 backdrop-blur-xl border border-border-default shadow-card',
          'sm:h-[72px] sm:pl-6 sm:pr-4',
        )}
      >
        <Link
          to="/"
          aria-label={t('header.logoAriaLabel')}
          className="shrink-0 inline-flex items-center rounded-xl transition-all duration-200 hover:opacity-90
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
        >
          {/* Invisible in light mode, with a subtle white halo in dark mode for the IDFM badge. */}
          <span className="block rounded-xl p-0 dark:bg-white dark:p-1.5 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_12px_rgba(0,0,0,0.4)] transition-all">
            <img
              src={logo}
              alt="Comutitres"
              className="h-9 w-auto sm:h-11 block select-none dark:h-8 dark:sm:h-10"
              draggable={false}
            />
          </span>
        </Link>

        <ul className="hidden items-center gap-1 sm:flex">
          <li>
            <NavLink
              to="/simulateur"
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
              )}
            >
              {t('header.nav.simulator')}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/forfaits"
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
              )}
            >
              {t('header.nav.plans')}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/souscrire"
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
              )}
            >
              {t('header.nav.subscribe')}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/assistant"
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
              )}
            >
              {t('header.nav.assistant')}
            </NavLink>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/mon-espace"
              aria-label={t('header.nav.account')}
              className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg bg-surface border border-border-default text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
            >
              <span className="grid place-items-center h-6 w-6 rounded-full bg-accent text-white text-xs font-semibold">
                {user.firstName.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-medium">{user.firstName}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex h-9 items-center gap-2 rounded-lg bg-surface border border-border-default text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">{t('header.nav.login')}</span>
            </Link>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t('header.menu.close') : t('header.menu.open')}
            aria-expanded={mobileOpen}
            className={cn(
              'sm:hidden h-9 w-9 grid place-items-center rounded-lg bg-surface border border-border-default text-fg-muted',
              'transition-colors duration-200 hover:bg-surface-hover hover:text-fg active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
            )}
          >
            {mobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown panel */}
      <div
        className={cn(
          'sm:hidden overflow-hidden transition-[max-height,opacity] duration-200 ease-out',
          mobileOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0',
        )}
      >
        <div className="rounded-2xl bg-bg-elevated/95 backdrop-blur-xl border border-border-default shadow-card p-3 flex flex-col gap-1">
          <NavLink
            to="/simulateur"
            className={({ isActive }) => cn(
              'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
            )}
          >
            {t('header.nav.simulator')}
          </NavLink>
          <NavLink
            to="/forfaits"
            className={({ isActive }) => cn(
              'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
            )}
          >
            {t('header.nav.plans')}
          </NavLink>
          <NavLink
            to="/souscrire"
            className={({ isActive }) => cn(
              'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
            )}
          >
            {t('header.nav.subscribe')}
          </NavLink>
          <NavLink
            to="/assistant"
            className={({ isActive }) => cn(
              'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
            )}
          >
            {t('header.nav.assistant')}
          </NavLink>
          {user ? (
            <NavLink
              to="/mon-espace"
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
              )}
            >
              {t('header.nav.account')}
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => cn(
                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'text-fg bg-surface' : 'text-fg-muted hover:text-fg hover:bg-surface',
              )}
            >
              {t('header.nav.login')}
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
