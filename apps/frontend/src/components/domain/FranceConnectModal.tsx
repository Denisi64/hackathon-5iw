import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { cn } from '../../lib/cn'
import type { VerificationProvider } from '../../data/subscriptionFlows'

/** Comptes officiels proposés par FranceConnect — noms propres, non traduits. */
const FC_PROVIDERS = ['Impots.gouv.fr', 'l’Assurance Maladie', 'La Poste', 'MSA', 'France Identité'] as const

export interface FranceConnectModalProps {
  open: boolean
  provider: VerificationProvider
  onClose: () => void
  onVerified: () => void
}

/**
 * Reproduit le parcours FranceConnect (mock) : choix d'un compte officiel,
 * connexion sécurisée simulée, puis confirmation des droits sans aucun upload.
 */
export function FranceConnectModal({ open, provider, onClose, onVerified }: FranceConnectModalProps) {
  const { t } = useTranslation()
  const [connecting, setConnecting] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Réinitialise l'état à chaque ouverture et nettoie le timer.
  useEffect(() => {
    if (!open) setConnecting(null)
    return () => clearTimeout(timer.current)
  }, [open])

  function connect(name: string) {
    setConnecting(name)
    timer.current = setTimeout(() => {
      onVerified()
      setConnecting(null)
    }, 1600)
  }

  return (
    <Modal open={open} onClose={onClose} title={t('subscription.verification.modalTitle')} closeLabel={t('timeline.close')}>
      {connecting ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden="true" />
          <p className="text-sm text-fg-muted">{t('subscription.verification.connecting', { provider: connecting })}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-fg-muted">{t('subscription.verification.modalSubtitle')}</p>
          <ul className="flex flex-col gap-2">
            {FC_PROVIDERS.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => connect(name)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border border-border-default bg-bg-elevated px-4 py-3 text-left',
                    'transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
                  )}
                >
                  <span className="text-sm font-medium text-fg">{name}</span>
                  <span className="font-mono text-[10px] tracking-widest uppercase text-accent">FranceConnect</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-1.5 text-xs text-fg-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {t(`subscription.verification.intro.${provider}`)}
          </p>
        </div>
      )}
    </Modal>
  )
}
