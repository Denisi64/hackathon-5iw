import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, LogIn, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/authStore'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const loginWithFranceConnect = useAuthStore((s) => s.loginWithFranceConnect)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFranceConnectSubmitting, setIsFranceConnectSubmitting] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setEmailError(null)
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(t('auth.errors.emailInvalid'))
      return
    }
    if (!password) {
      setError(t('auth.errors.passwordRequired'))
      return
    }

    setIsSubmitting(true)
    const result = await login(email.trim(), password)
    setIsSubmitting(false)

    if (!result.ok) {
      if (result.error === 'no_account') setError(t('auth.errors.noAccount'))
      else if (result.error === 'network') setError(t('auth.errors.network'))
      else setError(t('auth.errors.badPassword'))
      return
    }
    const from = (location.state as { from?: string } | null)?.from ?? '/mon-espace'
    navigate(from, { replace: true })
  }

  async function onFranceConnect() {
    setError(null)
    setEmailError(null)
    setIsFranceConnectSubmitting(true)
    const result = await loginWithFranceConnect()
    setIsFranceConnectSubmitting(false)

    if (!result.ok) {
      setError(t('auth.errors.franceConnect'))
      return
    }
    const from = (location.state as { from?: string } | null)?.from ?? '/mon-espace'
    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-3 text-center">
        <span className="font-mono text-xs tracking-widest uppercase text-fg-muted">{t('auth.login.kicker')}</span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          <span className="bg-gradient-to-b from-fg via-fg to-fg/60 bg-clip-text text-transparent">
            {t('auth.login.title')}
          </span>
        </h1>
        <p className="text-fg-muted">{t('auth.login.subtitle')}</p>
      </header>

      <Card>
        <Card.Body>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              loading={isFranceConnectSubmitting}
              onClick={onFranceConnect}
              leftIcon={<ShieldCheck className="h-4 w-4 text-[#000091]" aria-hidden="true" />}
              className="border-[#000091]/30 text-[#000091] hover:border-[#000091] hover:bg-[#000091]/5"
            >
              {t('auth.franceConnect.login')}
            </Button>

            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-normal text-fg-muted">
              <span className="h-px flex-1 bg-border-default" />
              {t('auth.franceConnect.or')}
              <span className="h-px flex-1 bg-border-default" />
            </div>

            <Input
              label={t('auth.fields.email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftAddon={<Mail className="h-4 w-4" aria-hidden="true" />}
              error={emailError ?? undefined}
            />
            <div>
              <Input
                label={t('auth.fields.password')}
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftAddon={<Lock className="h-4 w-4" aria-hidden="true" />}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg transition-colors"
              >
                {showPass ? <EyeOff className="h-3 w-3" aria-hidden="true" /> : <Eye className="h-3 w-3" aria-hidden="true" />}
                {showPass ? t('auth.passwordHide') : t('auth.passwordShow')}
              </button>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-rose-500">{error}</p>
            )}

            <Button
              type="submit"
              size="md"
              fullWidth
              loading={isSubmitting}
              leftIcon={<LogIn className="h-4 w-4" aria-hidden="true" />}
            >
              {t('auth.login.cta')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-muted">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-medium text-accent hover:underline">
              {t('auth.login.toRegister')}
            </Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}
