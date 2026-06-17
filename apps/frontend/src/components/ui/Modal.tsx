import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  /** Titre affiché dans l'en-tête ; sert aussi de libellé ARIA du dialogue. */
  title?: string
  closeLabel?: string
  children: ReactNode
  className?: string
}

/**
 * Dialogue modal accessible : `role="dialog"` + `aria-modal`, fermeture sur
 * Échap ou clic sur l'arrière-plan, scroll du body verrouillé, focus déplacé
 * dans le dialogue à l'ouverture. Rendu via portal sur `document.body`.
 */
export function Modal({ open, onClose, title, closeLabel = 'Fermer', children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: 'modal-fade 150ms ease-out' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        style={{ animation: 'modal-pop 180ms ease-out' }}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl border border-border-default bg-bg-elevated shadow-card-hover outline-none',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        {title && (
          <h2 id={titleId} className="px-6 pt-6 pr-12 text-xl font-semibold tracking-tight text-fg">
            {title}
          </h2>
        )}
        <div className={cn(title ? 'px-6 pb-6 pt-3' : 'p-6')}>{children}</div>
      </div>

      <style>{`
        @keyframes modal-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-pop { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>,
    document.body,
  )
}
