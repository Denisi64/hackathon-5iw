import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Upload, Mail,
  User as UserIcon, Lock,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Chip } from '../components/ui/Chip'
import { Badge } from '../components/ui/Badge'
import { Orb } from '../components/ui/Orb'
import { Slider } from '../components/ui/Slider'
import { PROFILES, PROFILE_BY_SLUG, type ProfileSlug } from '../data/subscriptionFlows'
import { PLANS } from '../utils/faresData'
import { formatCurrency } from '../lib/formatters'
import { useLocale } from '../hooks/useLocale'
import { cn } from '../lib/cn'
import type { Plan } from '../types/domain'
import { subscriptionsService } from '../services/subscriptions'
import { documentsService } from '../services/documents'
import { paymentsService } from '../services/payments'
import { useAuthStore } from '../stores/authStore'
import { getPlanName } from '../utils/planDisplay'

type Answers = {
  age?: number
  scholarship?: boolean
  zones: number
  daysPerWeek?: number
  employerRefund?: boolean
  cafBeneficiary?: boolean
  childrenCount?: number
  firstChildAge?: number
}

type Account = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

type DocStatus = 'idle' | 'analyzing' | 'valid'

const TOTAL_STEPS = 6
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SubscriptionScreen() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<ProfileSlug | null>(null)
  const [answers, setAnswers] = useState<Answers>({ zones: 5 })
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({})
  const [docConfidence, setDocConfidence] = useState<Record<string, number | null>>({})
  const [account, setAccount] = useState<Account>({ firstName: '', lastName: '', email: '', phone: '' })
  const [accountErrors, setAccountErrors] = useState<Partial<Record<keyof Account, string>>>({})
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const profileDef = profile ? PROFILE_BY_SLUG[profile] : null
  const plan = useMemo(
    () => (profileDef ? PLANS.find((f) => f.id === profileDef.recommendedPlanId) : undefined),
    [profileDef],
  )

  // Reset document statuses when the profile changes.
  useEffect(() => {
    setDocStatuses({})
  }, [profile])

  useEffect(() => {
    if (step === 6 && profileDef && plan) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 7)
      const sub = {
        planId: plan.id,
        planNom: plan.name,
        yearlyPrice: plan.yearlyPrice,
        monthlyPrice: plan.monthlyPrice,
        startDate: startDate.toISOString(),
        zones: answers.zones,
      }
      void sub
    }
  }, [step, profileDef, plan, answers.zones])

  function validateStep(): boolean {
    if (step === 1) return profile !== null
    if (step === 2) return true
    if (step === 3) return plan !== undefined
    if (step === 4) {
      if (!profileDef) return false
      return profileDef.documents.every((d) => docStatuses[d] === 'valid')
    }
    if (step === 5) {
      const errs: Partial<Record<keyof Account, string>> = {}
      if (!account.firstName.trim()) errs.firstName = t('subscription.errors.required')
      if (!account.lastName.trim()) errs.lastName = t('subscription.errors.required')
      if (!account.email.trim()) errs.email = t('subscription.errors.required')
      else if (!EMAIL_RE.test(account.email.trim())) errs.email = t('subscription.errors.email')
      setAccountErrors(errs)
      return Object.keys(errs).length === 0
    }
    return true
  }

  async function onNext() {
    if (!validateStep()) return
    setApiError(null)

    if (step === 3 && plan) {
      const user = useAuthStore.getState().user
      if (user && !subscriptionId) {
        setIsLoading(true)
        try {
          const sub = await subscriptionsService.create({ offerId: plan.id })
          setSubscriptionId(sub.id)
        } catch {
          setApiError(t('subscription.errors.createFailed'))
          setIsLoading(false)
          return
        }
        setIsLoading(false)
      }
    }

    if (step === TOTAL_STEPS) {
      const user = useAuthStore.getState().user
      if (user && subscriptionId) {
        setIsLoading(true)
        try {
          await subscriptionsService.confirm(subscriptionId)
          await paymentsService.redirectToCheckout(subscriptionId)
        } catch {
          setApiError(t('subscription.errors.paymentFailed'))
          setIsLoading(false)
        }
        return
      }
      navigate(user ? '/mon-espace' : '/register')
      return
    }

    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }
  function onBack() {
    setStep((s) => Math.max(1, s - 1))
  }

  async function handleUpload(docKey: string, file?: File) {
    setDocStatuses((s) => ({ ...s, [docKey]: 'analyzing' }))
    setApiError(null)
    if (file && subscriptionId) {
      try {
        const result = await documentsService.verify(subscriptionId, file)
        setDocConfidence((s) => ({ ...s, [docKey]: result.aiConfidence }))
        setDocStatuses((s) => ({ ...s, [docKey]: result.status === 'rejected' ? 'idle' : 'valid' }))
      } catch {
        setDocStatuses((s) => ({ ...s, [docKey]: 'idle' }))
        setApiError(t('subscription.errors.uploadFailed'))
      }
    } else {
      setTimeout(() => {
        setDocStatuses((s) => ({ ...s, [docKey]: 'valid' }))
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Header step={step} profileName={profile ? t(`subscription.profiles.${profile}.title`) : undefined} />

      <div key={step} className="animate-[fade-up_300ms_ease-out]">
        {step === 1 && <Step1Profile profile={profile} setProfile={setProfile} />}
        {step === 2 && profileDef && <Step2Details profile={profileDef.slug} answers={answers} setAnswers={setAnswers} />}
        {step === 3 && profileDef && plan && <Step3Recommendation profile={profileDef.slug} plan={plan} answers={answers} locale={locale} />}
        {step === 4 && profileDef && <Step4Documents profile={profileDef.slug} docs={profileDef.documents} statuses={docStatuses} confidence={docConfidence} onUpload={handleUpload} />}
        {step === 5 && <Step5Account account={account} setAccount={setAccount} errors={accountErrors} />}
        {step === 6 && profileDef && plan && <Step6Confirmation firstName={account.firstName} email={account.email} plan={plan} answers={answers} locale={locale} />}
      </div>

      {apiError && (
        <p role="alert" className="text-sm font-medium text-rose-500 text-center">{apiError}</p>
      )}

      {/* Nav bar */}
      <NavBar
        step={step}
        isLoading={isLoading}
        onBack={onBack}
        onNext={() => { void onNext() }}
        labelNext={step === TOTAL_STEPS
          ? (useAuthStore.getState().user && subscriptionId ? t('subscription.actions.pay') : useAuthStore.getState().user ? t('subscription.actions.toAccount') : t('subscription.actions.createAccount'))
          : step === 5 ? t('subscription.actions.confirm') : t('subscription.actions.next')}
        onSecondary={step === TOTAL_STEPS ? () => navigate('/') : undefined}
        labelSecondary={step === TOTAL_STEPS ? t('subscription.actions.finish') : undefined}
      />

      {/* Animations CSS inline car ponctuelles. */}
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes confetti-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--cx, 0), 180px) rotate(var(--cr, 0deg)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function Header({ step, profileName }: { step: number; profileName?: string }) {
  const { t } = useTranslation()
  const stepTitle = t(`subscription.steps.s${step}.title`)
  const stepDesc = t(`subscription.steps.s${step}.description`)
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-xs tracking-widest uppercase text-fg-muted">
          {t('subscription.kicker', { step, total: TOTAL_STEPS })}
        </span>
        {profileName && <Badge variant="info">{profileName}</Badge>}
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
        <span className="bg-gradient-to-b from-fg via-fg to-fg/60 bg-clip-text text-transparent">
          {stepTitle}
        </span>
      </h1>
      <p className="max-w-2xl text-fg-muted">{stepDesc}</p>
      {/* Progress bar */}
      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={cn(
              'h-1 rounded-full transition-colors duration-300',
              n < step ? 'bg-accent/50' : n === step ? 'bg-accent' : 'bg-surface',
            )}
          />
        ))}
      </div>
    </header>
  )
}

function Step1Profile({ profile, setProfile }: { profile: ProfileSlug | null; setProfile: (p: ProfileSlug) => void }) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {PROFILES.map((p) => {
        const Icon = p.icon
        const isActive = profile === p.slug
        return (
          <button
            key={p.slug}
            type="button"
            onClick={() => setProfile(p.slug)}
            className={cn(
              'group text-left rounded-2xl border bg-bg-elevated transition-all duration-200 p-5',
              'hover:-translate-y-0.5 hover:shadow-card-hover',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
              isActive ? 'border-accent shadow-button' : 'border-border-default shadow-card',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <Orb value={<Icon className="h-6 w-6" aria-hidden="true" />} label="" color={p.color} size="md" />
              {isActive && <Badge variant="recommended">{t('subscription.profiles.selected')}</Badge>}
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-fg">
              {t(`subscription.profiles.${p.slug}.title`)}
            </h3>
            <p className="mt-1 text-sm text-fg-muted">
              {t(`subscription.profiles.${p.slug}.description`)}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function Step2Details({ profile, answers, setAnswers }: {
  profile: ProfileSlug
  answers: Answers
  setAnswers: (u: Answers) => void
}) {
  const { t } = useTranslation()
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setAnswers({ ...answers, [k]: v })

  return (
    <Card>
      <Card.Body>
        <div className="flex flex-col gap-8">
          {(profile === 'student' || profile === 'scholar' || profile === 'senior') && (
            <Input
              label={t('subscription.questions.age')}
              type="number"
              inputMode="numeric"
              value={answers.age ?? ''}
              onChange={(e) => set('age', e.target.value ? Number(e.target.value) : undefined)}
            />
          )}

          {(profile === 'student' || profile === 'scholar') && (
            <YesNoRow
              label={t('subscription.questions.scholarship')}
              value={answers.scholarship}
              onChange={(v) => set('scholarship', v)}
            />
          )}

          {profile === 'worker' && (
            <>
              <Slider
                label={t('subscription.questions.daysPerWeek')}
                min={1} max={7}
                value={answers.daysPerWeek ?? 5}
                unit={t('simulator.slider.days.unit')}
                onChange={(v) => set('daysPerWeek', v)}
              />
              <YesNoRow
                label={t('subscription.questions.employerRefund')}
                value={answers.employerRefund}
                onChange={(v) => set('employerRefund', v)}
              />
            </>
          )}

          {profile === 'jobseeker' && (
            <YesNoRow
              label={t('subscription.questions.cafBeneficiary')}
              value={answers.cafBeneficiary}
              onChange={(v) => set('cafBeneficiary', v)}
            />
          )}

          {profile === 'parent' && (
            <>
              <Slider
                label={t('subscription.questions.childrenCount')}
                min={1} max={4}
                value={answers.childrenCount ?? 1}
                unit={t('subscription.questions.childrenUnit')}
                onChange={(v) => set('childrenCount', v)}
              />
              <Input
                label={t('subscription.questions.firstChildAge')}
                type="number"
                inputMode="numeric"
                value={answers.firstChildAge ?? ''}
                onChange={(e) => set('firstChildAge', e.target.value ? Number(e.target.value) : undefined)}
              />
            </>
          )}

          <Slider
            label={t('subscription.questions.zones')}
            min={1} max={5}
            value={answers.zones}
            unit={t('simulator.slider.zones.unit')}
            onChange={(v) => set('zones', v)}
          />
        </div>
      </Card.Body>
    </Card>
  )
}

function YesNoRow({ label, value, onChange }: { label: string; value?: boolean; onChange: (v: boolean) => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium tracking-wide text-fg-muted uppercase">{label}</p>
      <div className="flex gap-2">
        <Chip active={value === true} onClick={() => onChange(true)}>{t('common.yes')}</Chip>
        <Chip active={value === false} onClick={() => onChange(false)}>{t('common.no')}</Chip>
      </div>
    </div>
  )
}

function Step3Recommendation({ profile, plan, answers, locale }: {
  profile: ProfileSlug
  plan: Plan
  answers: Answers
  locale: string
}) {
  const { t } = useTranslation()
  void answers
  const reasonsKey = `subscription.recommendation.${profile}.reasons`
  const reasons = t(reasonsKey, { returnObjects: true }) as unknown as string[]
  const reasonsList = Array.isArray(reasons) ? reasons : []

  return (
    <Card variant="feature" spotlight>
      <Card.Body>
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <Badge variant="recommended">{t('simulator.recommended')}</Badge>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-fg">{getPlanName(plan, t)}</h2>
            <p className="mt-1 text-fg-muted">{t(`subscription.recommendation.${profile}.summary`)}</p>
            <ul className="mt-5 flex flex-col gap-2">
              {reasonsList.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-fg">
                  <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-surface border border-border-default p-5 min-w-[180px]">
            <p className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">
              {t('simulator.perYear')}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-fg tabular-nums">
              {plan.yearlyPrice !== null ? formatCurrency(plan.yearlyPrice, locale) : '—'}
            </p>
            {plan.monthlyPrice !== null && (
              <p className="mt-1 text-sm text-fg-muted">
                {formatCurrency(plan.monthlyPrice, locale)}{t('simulator.perMonth')}
              </p>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

function Step4Documents({ profile, docs, statuses, confidence, onUpload }: {
  profile: ProfileSlug
  docs: string[]
  statuses: Record<string, DocStatus>
  confidence: Record<string, number | null>
  onUpload: (key: string, file?: File) => void
}) {
  const { t } = useTranslation()
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  void profile
  return (
    <div className="flex flex-col gap-4">
      {docs.map((docKey) => {
        const status = statuses[docKey] ?? 'idle'
        const isFranceConnect = docKey === 'france_connect'
        const score = confidence[docKey]
        return (
          <Card key={docKey}>
            <Card.Body>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold tracking-tight text-fg">
                    {t(`subscription.documents.${docKey}.label`)}
                  </h3>
                  <p className="mt-1 text-sm text-fg-muted">
                    {t(`subscription.documents.${docKey}.help`)}
                  </p>
                </div>
                {status === 'valid' && (
                  <Badge variant="success">
                    <Check className="h-3 w-3" aria-hidden="true" /> {t('subscription.documents.validated')}
                    {score !== null && score !== undefined && <span className="ml-1 opacity-70">{score}%</span>}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                {!isFranceConnect && (
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    ref={(el) => { fileRefs.current[docKey] = el }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onUpload(docKey, file)
                      e.target.value = ''
                    }}
                  />
                )}
                {status === 'idle' && (
                  <Button
                    variant={isFranceConnect ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => isFranceConnect ? onUpload(docKey) : fileRefs.current[docKey]?.click()}
                    leftIcon={isFranceConnect ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                  >
                    {isFranceConnect ? t('subscription.documents.franceConnect') : t('subscription.documents.upload')}
                  </Button>
                )}
                {status === 'analyzing' && (
                  <div className="flex items-center gap-2 text-sm text-fg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>{t('subscription.documents.analyzing')}</span>
                  </div>
                )}
                {status === 'valid' && (
                  <p className="text-sm text-fg-muted">{t('subscription.documents.validatedHint')}</p>
                )}
              </div>
            </Card.Body>
          </Card>
        )
      })}
    </div>
  )
}

function Step5Account({ account, setAccount, errors }: {
  account: Account
  setAccount: (a: Account) => void
  errors: Partial<Record<keyof Account, string>>
}) {
  const { t } = useTranslation()
  return (
    <Card>
      <Card.Body>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('subscription.account.firstName')}
            value={account.firstName}
            onChange={(e) => setAccount({ ...account, firstName: e.target.value })}
            leftAddon={<UserIcon className="h-4 w-4" aria-hidden="true" />}
            error={errors.firstName}
          />
          <Input
            label={t('subscription.account.lastName')}
            value={account.lastName}
            onChange={(e) => setAccount({ ...account, lastName: e.target.value })}
            error={errors.lastName}
          />
          <Input
            label={t('subscription.account.email')}
            type="email"
            inputMode="email"
            value={account.email}
            onChange={(e) => setAccount({ ...account, email: e.target.value })}
            leftAddon={<Mail className="h-4 w-4" aria-hidden="true" />}
            error={errors.email}
            className="sm:col-span-2"
          />
          <Input
            label={t('subscription.account.phone')}
            type="tel"
            inputMode="tel"
            value={account.phone}
            onChange={(e) => setAccount({ ...account, phone: e.target.value })}
            helperText={t('subscription.account.phoneHint')}
            className="sm:col-span-2"
          />
        </div>
      </Card.Body>
    </Card>
  )
}

function Step6Confirmation({ firstName, email, plan, answers, locale }: {
  firstName: string
  email: string
  plan: Plan
  answers: Answers
  locale: string
}) {
  const { t } = useTranslation()
  void answers
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7)
  const startDateStr = startDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

  // Petites particules de confetti.
  const confettiColors = ['var(--accent)', '#A855F7', '#F59E0B', '#10B981', '#EC4899']
  const confetti = Array.from({ length: 14 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 14
    const cx = Math.round(Math.cos(angle) * 120)
    const color = confettiColors[i % confettiColors.length]
    const delay = (i * 80) % 600
    return { cx, color, delay, cr: angle * (180 / Math.PI) }
  })

  return (
    <Card variant="feature" spotlight>
      <Card.Body>
        <div className="relative flex flex-col items-center gap-6 text-center py-8">
          {/* Confetti */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
            {confetti.map((c, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  background: c.color,
                  ['--cx' as string]: `${c.cx}px`,
                  ['--cr' as string]: `${c.cr}deg`,
                  animation: `confetti-fall 1200ms ease-out ${c.delay}ms forwards`,
                } as CSSProperties}
              />
            ))}
          </div>
          <div className="grid place-items-center h-20 w-20 rounded-full bg-accent/10 border border-accent/30">
            <CheckCircle2 className="h-10 w-10 text-accent" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">
              {t('subscription.confirmation.welcome', { firstName: firstName || t('subscription.confirmation.you') })}
            </h2>
            <p className="mt-2 text-fg-muted">{t('subscription.confirmation.subtitle')}</p>
          </div>

          <div className="w-full max-w-md rounded-xl bg-surface border border-border-default p-5 text-left">
            <p className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('subscription.confirmation.summary')}</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Row label={t('subscription.confirmation.plan')} value={getPlanName(plan, t)} />
              <Row label={t('subscription.confirmation.price')} value={plan.yearlyPrice !== null ? formatCurrency(plan.yearlyPrice, locale) + t('simulator.perYear') : '—'} />
              <Row label={t('subscription.confirmation.startDate')} value={startDateStr} />
              <Row label={t('subscription.confirmation.email')} value={email} />
            </div>
          </div>

          <p className="text-sm text-fg-muted max-w-md">
            {t('subscription.confirmation.emailSent', { email })}
          </p>
        </div>
      </Card.Body>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg text-right">{value}</span>
    </div>
  )
}

function NavBar({ step, isLoading, onBack, onNext, labelNext, onSecondary, labelSecondary }: {
  step: number
  isLoading?: boolean
  onBack: () => void
  onNext: () => void
  labelNext: string
  onSecondary?: () => void
  labelSecondary?: string
}) {
  const { t } = useTranslation()
  return (
    <div className="sticky bottom-3 z-30 mx-auto w-full">
      <div className="rounded-2xl bg-bg-elevated/90 backdrop-blur-xl border border-border-default shadow-card p-3 flex items-center justify-between gap-3">
        {step > 1 ? (
          <Button variant="ghost" size="md" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
            {t('subscription.actions.back')}
          </Button>
        ) : <span />}
        <div className="flex items-center gap-2">
          {onSecondary && labelSecondary && (
            <Button variant="ghost" size="md" onClick={onSecondary}>{labelSecondary}</Button>
          )}
          <Button size="md" onClick={onNext} disabled={isLoading}
            leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : undefined}
            rightIcon={!isLoading && step !== TOTAL_STEPS ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : undefined}>
            {labelNext}
          </Button>
        </div>
      </div>
    </div>
  )
}
