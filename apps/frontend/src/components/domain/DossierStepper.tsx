import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, FileText, Loader2, ShieldCheck, Send } from 'lucide-react'
import { cn } from '../../lib/cn'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { DOSSIER_STAGES, getDossierStageIndex, isDossierComplete } from '../../utils/dossierStatus'

const STAGE_ICONS = [FileText, Loader2, ShieldCheck, Send] as const

export interface DossierStepperProps {
  submittedAt?: string
}

export function DossierStepper({ submittedAt }: DossierStepperProps) {
  const { t } = useTranslation()
  const reducedMotion = usePrefersReducedMotion()
  const [now, setNow] = useState(() => Date.now())

  // Tant que le dossier n'est pas finalisé, on rafraîchit pour le faire avancer.
  useEffect(() => {
    if (isDossierComplete(submittedAt, now)) return
    const id = setInterval(() => setNow(Date.now()), 3000)
    return () => clearInterval(id)
  }, [submittedAt, now])

  const current = getDossierStageIndex(submittedAt, now)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-fg">{t('monEspace.dossier.title')}</h3>
        {!isDossierComplete(submittedAt, now) && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-fg-muted">
            <span className={cn('h-1.5 w-1.5 rounded-full bg-accent', !reducedMotion && 'animate-pulse')} aria-hidden="true" />
            {t('monEspace.dossier.updated')}
          </span>
        )}
      </div>

      <ol className="flex items-start">
        {DOSSIER_STAGES.map((stage, i) => {
          const Icon = STAGE_ICONS[i]
          const done = i < current
          const active = i === current
          const isLast = i === DOSSIER_STAGES.length - 1
          return (
            <li key={stage} className="flex flex-1 flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
              <div className="flex w-full items-center">
                {/* Connecteur gauche */}
                <span className={cn('h-0.5 flex-1 rounded-full transition-colors duration-500', i === 0 ? 'opacity-0' : done || active ? 'bg-accent/60' : 'bg-surface')} aria-hidden="true" />
                {/* Pastille */}
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-500',
                    done && 'border-accent bg-accent text-white',
                    active && 'border-accent text-accent',
                    !done && !active && 'border-border-default bg-surface text-fg-subtle',
                  )}
                >
                  {done ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Icon className={cn('h-4 w-4', active && i === 1 && !reducedMotion && 'animate-spin')} aria-hidden="true" />
                  )}
                </span>
                {/* Connecteur droit */}
                <span className={cn('h-0.5 flex-1 rounded-full transition-colors duration-500', isLast ? 'opacity-0' : done ? 'bg-accent/60' : 'bg-surface')} aria-hidden="true" />
              </div>
              <span className={cn('mt-2 text-xs', done || active ? 'font-medium text-fg' : 'text-fg-muted')}>
                {t(`monEspace.dossier.${stage}`)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
