import { useId, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { HelpCircle } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { GlossaryTermId } from '../../utils/glossaire'

export interface GlossaryTooltipProps {
  /** Terme du glossaire — libellé et définition résolus via i18n. */
  term: GlossaryTermId
  /** Surcharge optionnelle du texte déclencheur (sinon le libellé du terme). */
  children?: ReactNode
  className?: string
}

/**
 * Terme technique souligné qui révèle sa définition au survol, au focus ou au clic.
 * Accessible : déclencheur focusable au clavier, `aria-describedby` quand ouvert,
 * fermeture sur Échap.
 */
export function GlossaryTooltip({ term, children, className }: GlossaryTooltipProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const tooltipId = useId()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const label = children ?? t(`glossary.${term}.term`)

  function show() {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  // Petit délai pour permettre le passage souris bouton → bulle sans la fermer.
  function scheduleHide() {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 100)
  }

  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        onFocus={show}
        onBlur={scheduleHide}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm font-medium text-fg',
          'underline decoration-dotted decoration-fg-subtle underline-offset-4',
          'transition-colors hover:decoration-accent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        )}
      >
        {label}
        <HelpCircle className="h-3.5 w-3.5 text-fg-subtle" aria-hidden="true" />
      </button>

      {open && (
        <span
          role="tooltip"
          id={tooltipId}
          onMouseEnter={show}
          onMouseLeave={scheduleHide}
          className={cn(
            'absolute left-0 bottom-full z-50 mb-2 w-64 max-w-[80vw] rounded-xl',
            'border border-border-default bg-bg-elevated p-3 shadow-card-hover',
            'text-sm font-normal leading-relaxed text-fg-muted',
          )}
        >
          <span className="mb-1 block font-semibold text-fg">{t(`glossary.${term}.term`)}</span>
          {t(`glossary.${term}.definition`)}
        </span>
      )}
    </span>
  )
}
