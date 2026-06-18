import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Upload, Mail,
  User as UserIcon, Lock, CalendarDays, GraduationCap, WalletCards, CloudUpload,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { PROFILE_BY_SLUG, type ProfileSlug } from '../data/subscriptionFlows'
import { PLANS, PLAN_ID_TO_OFFER_ID } from '../utils/faresData'
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
  student?: boolean
  scholarship?: boolean
  mainLocation?: string
}

type Account = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

type DocStatus = 'idle' | 'analyzing' | 'valid'

const TOTAL_STEPS = 7
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function inferProfileFromAnswers({ age, student }: Answers): ProfileSlug {
  if (student && (age === undefined || age < 29)) return 'student'
  if ((age ?? 0) >= 62) return 'senior'
  return 'worker'
}

export default function SubscriptionScreen() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<ProfileSlug | null>(null)
  const [answers, setAnswers] = useState<Answers>({})
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
  const primaryDocumentKey = profileDef?.documents[0] ?? 'school_certificate'

  // Reset document statuses when the profile changes.
  useEffect(() => {
    setDocStatuses({})
  }, [profile])

  function validateStep(): boolean {
    if (step === 1) return true
    if (step === 2) return profile !== null
    if (step === 3) return true
    if (step === 4) return plan !== undefined
    if (step === 5) {
      if (!profileDef) return false
      const optional = new Set(profileDef.optionalDocuments ?? [])
      return profileDef.documents.every((d) => optional.has(d) || docStatuses[d] === 'valid')
    }
    if (step === 6) {
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

    if (step === 4 && plan) {
      const user = useAuthStore.getState().user
      if (user && !subscriptionId) {
        setIsLoading(true)
        try {
          const offerId = PLAN_ID_TO_OFFER_ID[plan.id] ?? plan.id
          const sub = await subscriptionsService.create({ offerId })
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
        {step === 1 && (
          <Step1SituationForm
            answers={answers}
            setAnswers={setAnswers}
            setProfile={setProfile}
            onContinue={() => { void onNext() }}
          />
        )}
        {step === 2 && plan && <Step2Solution plan={plan} answers={answers} locale={locale} onContinue={() => { void onNext() }} />}
        {step === 3 && profileDef && (
          <Step3DocumentUpload
            documentLabel={t(`subscription.documents.${primaryDocumentKey}.label`)}
            status={docStatuses[primaryDocumentKey] ?? 'idle'}
            onUpload={(file) => handleUpload(primaryDocumentKey, file)}
            onContinue={() => { void onNext() }}
          />
        )}
        {step === 4 && profileDef && plan && <Step4Recommendation profile={profileDef.slug} plan={plan} locale={locale} />}
        {step === 5 && profileDef && <Step5Documents docs={profileDef.documents} statuses={docStatuses} confidence={docConfidence} onUpload={handleUpload} />}
        {step === 6 && <Step6Account account={account} setAccount={setAccount} errors={accountErrors} />}
        {step === 7 && profileDef && plan && <Step7Confirmation firstName={account.firstName} email={account.email} plan={plan} locale={locale} />}
      </div>

      {apiError && (
        <p role="alert" className="text-sm font-medium text-rose-500 text-center">{apiError}</p>
      )}

      {/* Nav bar */}
      {step > 2 && (
        <NavBar
          step={step}
          isLoading={isLoading}
          onBack={onBack}
          onNext={() => { void onNext() }}
          labelNext={step === TOTAL_STEPS
            ? (useAuthStore.getState().user && subscriptionId ? t('subscription.actions.pay') : useAuthStore.getState().user ? t('subscription.actions.toAccount') : t('subscription.actions.createAccount'))
            : step === 6 ? t('subscription.actions.confirm') : t('subscription.actions.next')}
          onSecondary={step === TOTAL_STEPS ? () => navigate('/') : undefined}
          labelSecondary={step === TOTAL_STEPS ? t('subscription.actions.finish') : undefined}
        />
      )}

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
  const badgeKey = step === 1 ? 'subscription.kickerShort' : 'subscription.stepBadge'
  return (
    <header className="flex flex-col items-start gap-5 sm:gap-7">
      <div className="flex w-full items-center justify-between gap-3">
        <span className="rounded-xl bg-[#096AF3] px-5 py-3 text-lg font-black uppercase leading-none tracking-normal text-white shadow-[0_10px_24px_rgba(9,106,243,0.25)] sm:rounded-2xl sm:px-7 sm:py-4 sm:text-2xl lg:px-5 lg:py-3 lg:text-lg xl:text-xl">
          {t(badgeKey, { step })}
        </span>
        {profileName && <Badge variant="info">{profileName}</Badge>}
      </div>
      <h1 className="max-w-5xl text-3xl font-black uppercase leading-[0.98] tracking-normal text-[#096AF3] sm:text-5xl lg:text-4xl xl:text-5xl">
        {stepTitle}
      </h1>
      <p className="max-w-4xl text-xl font-extrabold leading-snug text-[#070525] sm:text-3xl lg:text-xl xl:text-2xl">{stepDesc}</p>
    </header>
  )
}

function EpisodeFrame({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-white px-4 pb-8 pt-8 shadow-[0_26px_80px_rgba(9,106,243,0.08)] sm:px-8 lg:px-12 xl:px-16">
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#096AF3]/8 to-transparent" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white px-6 pb-8 pt-6 text-[#070525] shadow-[0_28px_80px_rgba(7,5,37,0.18)] sm:rounded-[2.5rem] sm:px-10 sm:pb-10 sm:pt-8 lg:px-12">
          {children}
        </div>
      </div>
    </section>
  )
}

function EpisodeProgress({ label, episode, total, className, barClassName }: {
  label: string
  episode: number
  total: number
  className?: string
  barClassName?: string
}) {
  const progress = `${Math.min(100, Math.max(0, (episode / total) * 100))}%`
  return (
    <div className={cn('mt-8 text-center lg:mt-5 xl:mt-6', className)}>
      <p className="text-xs font-black sm:text-sm lg:text-sm">{label}</p>
      <div className={cn('mx-auto mt-4 h-2 w-56 overflow-hidden rounded-full bg-[#E8EEF5] lg:mt-3 lg:h-1.5', barClassName)}>
        <div className="h-full rounded-full bg-[#096AF3]" style={{ width: progress }} />
      </div>
    </div>
  )
}

function EpisodePrimaryButton({ children, onClick, className }: {
  children: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'mt-10 flex h-14 w-full items-center justify-center rounded-xl bg-[#096AF3] px-5 text-lg font-extrabold text-white shadow-[0_12px_28px_rgba(9,106,243,0.28)] transition hover:bg-[#075cd6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#096AF3] focus-visible:ring-offset-2 sm:h-16 sm:text-xl lg:h-12 lg:text-base xl:h-14 xl:text-lg',
        className,
      )}
    >
      {children}
    </button>
  )
}

function Step1SituationForm({ answers, setAnswers, setProfile, onContinue }: {
  answers: Answers
  setAnswers: (u: Answers) => void
  setProfile: (p: ProfileSlug) => void
  onContinue: () => void
}) {
  const { t } = useTranslation()
  const age = answers.age ?? 20
  const isStudent = answers.student ?? true
  const isScholarship = answers.scholarship ?? true
  const mainLocation = answers.mainLocation ?? t('subscription.situationIntro.defaultLocation')

  function updateAnswer(next: Partial<Answers>) {
    setAnswers({ ...answers, ...next })
  }

  function handleContinue() {
    const nextAnswers = {
      ...answers,
      age,
      student: isStudent,
      scholarship: isScholarship,
      mainLocation,
    }
    setProfile(inferProfileFromAnswers(nextAnswers))
    setAnswers(nextAnswers)
    onContinue()
  }

  return (
    <EpisodeFrame>
      <EpisodeProgress
        label={t('subscription.situationIntro.episodeProgress')}
        episode={1}
        total={5}
        barClassName="lg:w-40 xl:w-44"
      />

      <div className="mt-10 lg:mt-7 xl:mt-8">
        <h2 className="text-2xl font-black leading-tight tracking-normal sm:text-3xl lg:text-2xl xl:text-3xl">
          {t('subscription.situationIntro.phoneTitle')}
        </h2>
      </div>

      <div className="mt-7 divide-y divide-slate-200 lg:mt-5 xl:mt-6">
        <SituationFormRow
          icon={<CalendarDays className="h-7 w-7 lg:h-5 lg:w-5 xl:h-6 xl:w-6" aria-hidden="true" />}
          label={t('subscription.situationIntro.ageQuestion')}
        >
          <label className="sr-only" htmlFor="subscription-age">{t('subscription.situationIntro.ageQuestion')}</label>
          <input
            id="subscription-age"
            type="number"
            min={0}
            value={age}
            onChange={(event) => updateAnswer({ age: event.target.value ? Number(event.target.value) : undefined })}
            className="w-16 rounded-lg border border-transparent bg-transparent px-1 text-right text-sm font-black text-[#070525] outline-none focus:border-[#096AF3] focus:bg-[#F4F8FE] sm:w-20 sm:text-base lg:w-16 lg:text-sm xl:text-base"
          />
          <span className="text-sm font-black sm:text-base lg:text-sm xl:text-base">{t('subscription.situationIntro.yearsUnit')}</span>
        </SituationFormRow>

        <SituationFormRow
          icon={<GraduationCap className="h-7 w-7 lg:h-5 lg:w-5 xl:h-6 xl:w-6" aria-hidden="true" />}
          label={t('subscription.situationIntro.studentQuestion')}
        >
          <SegmentedYesNo value={isStudent} onChange={(value) => updateAnswer({ student: value })} />
        </SituationFormRow>

        <SituationFormRow
          icon={<Lock className="h-7 w-7 lg:h-5 lg:w-5 xl:h-6 xl:w-6" aria-hidden="true" />}
          label={t('subscription.situationIntro.scholarshipQuestion')}
        >
          <SegmentedYesNo value={isScholarship} onChange={(value) => updateAnswer({ scholarship: value })} />
        </SituationFormRow>
      </div>

      <EpisodePrimaryButton onClick={handleContinue} className="lg:mt-6 xl:mt-7">
        {t('subscription.situationIntro.continue')}
      </EpisodePrimaryButton>
    </EpisodeFrame>
  )
}

function SituationFormRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 py-4 sm:grid-cols-[2rem_1fr_auto] sm:gap-4 sm:py-5 lg:grid-cols-[1.75rem_1fr_auto] lg:gap-3 lg:py-3.5 xl:grid-cols-[2rem_1fr_auto] xl:py-4">
      <span className="text-[#096AF3]">{icon}</span>
      <span className="text-sm font-black leading-tight text-[#070525] sm:text-base lg:text-sm xl:text-base">{label}</span>
      <div className="flex min-w-[5rem] justify-end text-right sm:min-w-[5.5rem] lg:min-w-[5rem] xl:min-w-[5.5rem]">{children}</div>
    </div>
  )
}

function SegmentedYesNo({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex rounded-lg bg-[#F4F8FE] p-0.5 sm:p-1 lg:p-0.5 xl:p-1">
      {[true, false].map((option) => (
        <button
          key={String(option)}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'h-8 min-h-0 rounded-md px-2.5 text-xs font-black transition sm:h-9 sm:px-3 sm:text-sm lg:h-8 lg:px-2.5 lg:text-sm xl:h-9 xl:px-3',
            value === option ? 'bg-white text-[#096AF3] shadow-sm' : 'text-[#070525]/55 hover:text-[#070525]',
          )}
        >
          {option ? t('common.yes') : t('common.no')}
        </button>
      ))}
    </div>
  )
}

function Step2Solution({ plan, answers, locale, onContinue }: {
  plan: Plan
  answers: Answers
  locale: string
  onContinue: () => void
}) {
  const { t } = useTranslation()
  const reasonList = [
    t(answers.student === false ? 'subscription.solutionIntro.reasonStudentNo' : 'subscription.solutionIntro.reasonStudentYes'),
    t(answers.scholarship === false ? 'subscription.solutionIntro.reasonScholarshipNo' : 'subscription.solutionIntro.reasonScholarshipYes'),
    t('subscription.solutionIntro.reasonLocation', {
      location: answers.mainLocation || t('subscription.situationIntro.defaultLocation'),
    }),
  ]
  const priceLabel = plan.monthlyPrice !== null
    ? `${formatCurrency(plan.monthlyPrice, locale)}${t('simulator.perMonth')}`
    : plan.yearlyPrice !== null
      ? `${formatCurrency(plan.yearlyPrice, locale)}${t('simulator.perYear')}`
      : t('plans.priceVariable')

  return (
    <EpisodeFrame>
      <EpisodeProgress
        label={t('subscription.solutionIntro.episodeProgress')}
        episode={2}
        total={5}
        barClassName="lg:w-56 xl:w-64"
      />

      <h2 className="mt-10 text-2xl font-black leading-tight tracking-normal sm:text-3xl lg:mt-8 lg:text-2xl xl:text-3xl">
        {t('subscription.solutionIntro.phoneTitle')}
      </h2>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(7,5,37,0.08)] sm:px-6 sm:py-6 lg:mt-6 lg:px-7 lg:py-6 xl:mt-7 xl:px-8 xl:py-7">
        <div className="flex items-start justify-between gap-5">
          <h3 className="text-xl font-black uppercase leading-tight tracking-normal text-[#096AF3] sm:text-2xl lg:text-2xl xl:text-3xl">
            {getPlanName(plan, t)}
          </h3>
          <WalletCards className="h-11 w-11 shrink-0 text-[#096AF3] sm:h-12 sm:w-12 lg:h-12 lg:w-12 xl:h-14 xl:w-14" strokeWidth={2.2} aria-hidden="true" />
        </div>

        <p className="mt-6 text-base font-black sm:text-lg lg:text-base xl:text-lg">{t('subscription.solutionIntro.why')}</p>
        <ul className="mt-4 flex flex-col gap-3 sm:mt-5 sm:gap-4 lg:gap-3">
          {reasonList.map((reason) => (
            <li key={reason} className="flex items-start gap-3 text-base font-black leading-snug sm:gap-4 sm:text-lg lg:text-base xl:text-lg">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#070525] sm:h-6 sm:w-6 lg:h-5 lg:w-5 xl:h-6 xl:w-6" strokeWidth={3} aria-hidden="true" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-200 pt-5 lg:mt-6 xl:mt-7">
          <p className="text-2xl font-black tracking-normal text-[#096AF3] sm:text-3xl lg:text-2xl xl:text-3xl">{priceLabel}</p>
          <button
            type="button"
            className="min-h-0 rounded-lg px-2 py-1 text-sm font-black text-[#096AF3] transition hover:bg-[#096AF3]/5 sm:text-base lg:text-sm xl:text-base"
          >
            {t('subscription.solutionIntro.learnMore')}
          </button>
        </div>
      </div>

      <EpisodePrimaryButton onClick={onContinue} className="lg:mt-7 xl:mt-8">
        {t('subscription.solutionIntro.continue')}
      </EpisodePrimaryButton>
    </EpisodeFrame>
  )
}

function Step3DocumentUpload({ documentLabel, status, onUpload, onContinue }: {
  documentLabel: string
  status: DocStatus
  onUpload: (file: File) => void
  onContinue: () => void
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleFile(file?: File) {
    if (file) onUpload(file)
  }

  return (
    <EpisodeFrame>
      <EpisodeProgress
        label={t('subscription.documentIntro.episodeProgress')}
        episode={3}
        total={5}
        barClassName="lg:w-56 xl:w-64"
      />

      <h2 className="mt-10 text-2xl font-black leading-tight tracking-normal sm:text-3xl lg:mt-8 lg:text-2xl xl:text-3xl">
        {t('subscription.documentIntro.phoneTitle', { document: documentLabel })}
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          handleFile(event.dataTransfer.files?.[0])
        }}
        className="mt-8 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#096AF3]/75 px-5 py-10 text-center transition hover:bg-[#096AF3]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#096AF3] focus-visible:ring-offset-2 sm:py-12 lg:mt-7 lg:py-9 xl:py-11"
      >
        {status === 'analyzing' ? (
          <Loader2 className="h-14 w-14 animate-spin text-[#096AF3] sm:h-16 sm:w-16 lg:h-14 lg:w-14" aria-hidden="true" />
        ) : status === 'valid' ? (
          <CheckCircle2 className="h-14 w-14 text-[#096AF3] sm:h-16 sm:w-16 lg:h-14 lg:w-14" aria-hidden="true" />
        ) : (
          <CloudUpload className="h-16 w-16 text-[#096AF3] sm:h-20 sm:w-20 lg:h-16 lg:w-16" strokeWidth={2.1} aria-hidden="true" />
        )}
        <span className="mt-6 text-base font-black leading-tight text-[#070525] sm:text-lg lg:text-base xl:text-lg">
          {status === 'analyzing'
            ? t('subscription.documentIntro.analyzing')
            : status === 'valid'
              ? t('subscription.documentIntro.uploaded')
              : t('subscription.documentIntro.drop')}
        </span>
        {status === 'idle' && (
          <span className="mt-1 text-base font-black text-[#096AF3] sm:text-lg lg:text-base xl:text-lg">
            {t('subscription.documentIntro.browse')}
          </span>
        )}
      </button>

      <p className="mt-5 text-center text-sm font-extrabold text-slate-400 sm:text-base lg:text-sm xl:text-base">
        {t('subscription.documentIntro.formats')}
      </p>

      <div className="mt-9 flex items-center gap-5 text-[#070525] lg:mt-8">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#070525] sm:h-14 sm:w-14 lg:h-12 lg:w-12">
          <Lock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-6 lg:w-6" aria-hidden="true" />
        </span>
        <p className="text-base font-black leading-snug sm:text-lg lg:text-base xl:text-lg">
          {t('subscription.documentIntro.security')}
        </p>
      </div>

      <EpisodePrimaryButton onClick={onContinue} className="lg:mt-8 xl:mt-9">
        {t('subscription.documentIntro.continue')}
      </EpisodePrimaryButton>
    </EpisodeFrame>
  )
}

function Step4Recommendation({ profile, plan, locale }: {
  profile: ProfileSlug
  plan: Plan
  locale: string
}) {
  const { t } = useTranslation()
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

function Step5Documents({ docs, optionalDocs, statuses, confidence, onUpload }: {
  docs: string[]
  optionalDocs?: string[]
  statuses: Record<string, DocStatus>
  confidence: Record<string, number | null>
  onUpload: (key: string, file?: File) => void
}) {
  const { t } = useTranslation()
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const optionalSet = new Set(optionalDocs ?? [])
  return (
    <div className="flex flex-col gap-4">
      {docs.map((docKey) => {
        const status = statuses[docKey] ?? 'idle'
        const isFranceConnect = docKey === 'france_connect'
        const isOptional = optionalSet.has(docKey)
        const score = confidence[docKey]
        return (
          <Card key={docKey}>
            <Card.Body>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold tracking-tight text-fg">
                      {t(`subscription.documents.${docKey}.label`)}
                    </h3>
                    {isOptional && <Badge variant="neutral">{t('subscription.documents.optional')}</Badge>}
                  </div>
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

function Step6Account({ account, setAccount, errors }: {
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

function Step7Confirmation({ firstName, email, plan, locale }: {
  firstName: string
  email: string
  plan: Plan
  locale: string
}) {
  const { t } = useTranslation()
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
