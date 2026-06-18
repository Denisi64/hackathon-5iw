import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useLocale } from '../hooks/useLocale'
import { useAuthStore } from '../stores/authStore'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterScreen() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const loginWithFranceConnect = useAuthStore((s) => s.loginWithFranceConnect)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFranceConnectSubmitting, setIsFranceConnectSubmitting] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!firstName.trim()) next.firstName = t('auth.errors.required')
    if (!lastName.trim()) next.lastName = t('auth.errors.required')
    if (!email.trim()) next.email = t('auth.errors.required')
    else if (!EMAIL_RE.test(email.trim())) next.email = t('auth.errors.emailInvalid')
    if (!password) next.password = t('auth.errors.required')
    else if (password.length < 8) next.password = t('auth.errors.passwordShort')
    if (confirm !== password) next.confirm = t('auth.errors.passwordMismatch')
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setIsSubmitting(true)
    const result = await register({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, language: locale })
    setIsSubmitting(false)

    if (!result.ok) {
      setErrors({ email: result.error === 'email_taken' ? t('auth.errors.emailTaken') : t('auth.errors.network') })
      return
    }
    navigate('/centres-interet', { replace: true })
  }

  async function onFranceConnect() {
    setErrors({})
    setIsFranceConnectSubmitting(true)
    const result = await loginWithFranceConnect()
    setIsFranceConnectSubmitting(false)

    if (!result.ok) {
      setErrors({ root: t('auth.errors.franceConnect') })
      return
    }
    navigate('/centres-interet', { replace: true })
  }

  return (
    <div className="mx-auto max-w-md flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-3 text-center">
        <span className="font-mono text-xs tracking-widest uppercase text-fg-muted">{t('auth.register.kicker')}</span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          <span className="bg-gradient-to-b from-fg via-fg to-fg/60 bg-clip-text text-transparent">
            {t('auth.register.title')}
          </span>
        </h1>
        <p className="text-fg-muted">{t('auth.register.subtitle')}</p>
      </header>

      <Card>
        <Card.Body>
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            loading={isFranceConnectSubmitting}
            onClick={onFranceConnect}
            leftIcon={<ShieldCheck className="h-4 w-4 text-[#000091]" aria-hidden="true" />}
            className="mb-4 border-[#000091]/30 text-[#000091] hover:border-[#000091] hover:bg-[#000091]/5"
          >
            {t('auth.franceConnect.register')}
          </Button>

          <div className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-normal text-fg-muted">
            <span className="h-px flex-1 bg-border-default" />
            {t('auth.franceConnect.or')}
            <span className="h-px flex-1 bg-border-default" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={t('auth.fields.firstName')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                leftAddon={<UserIcon className="h-4 w-4" aria-hidden="true" />}
                error={errors.firstName}
                autoComplete="given-name"
              />
              <Input
                label={t('auth.fields.lastName')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
                autoComplete="family-name"
              />
            </div>
            <Input
              label={t('auth.fields.email')}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftAddon={<Mail className="h-4 w-4" aria-hidden="true" />}
              error={errors.email}
            />
            <div>
              <Input
                label={t('auth.fields.password')}
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftAddon={<Lock className="h-4 w-4" aria-hidden="true" />}
                helperText={t('auth.passwordHint')}
                error={errors.password}
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
            <Input
              label={t('auth.fields.passwordConfirm')}
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              leftAddon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              error={errors.confirm}
            />

            {errors.root && (
              <p role="alert" className="text-sm font-medium text-rose-500">{errors.root}</p>
            )}

            <Button type="submit" size="md" fullWidth loading={isSubmitting}>
              {t('auth.register.cta')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-muted">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-accent hover:underline">
              {t('auth.register.toLogin')}
            </Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}
