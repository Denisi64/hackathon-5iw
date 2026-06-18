import { CreditCard } from 'lucide-react'

export interface NavigoCardProps {
  offerName: string | null
  firstName: string
  lastName: string
  endDate: string | null
  /** Locale BCP-47 pour le formatage de la date d'échéance. */
  locale?: string
}

/** Carte de transport virtuelle, style « titre dématérialisé » IDFM. */
export function NavigoCard({ offerName, firstName, lastName, endDate, locale = 'fr-FR' }: NavigoCardProps) {
  const expiry = endDate
    ? new Date(endDate).toLocaleDateString(locale, { month: '2-digit', year: '2-digit' })
    : null
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-blue-800 p-6 text-white shadow-card-hover">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-white/70">île-de-France Mobilités</p>
          <p className="mt-1 text-xl font-bold tracking-tight">Navigo</p>
        </div>
        <CreditCard className="h-7 w-7 text-white/80" aria-hidden="true" />
      </div>

      <p className="mt-8 text-lg font-semibold tracking-tight">{offerName ?? 'Navigo'}</p>

      <div className="mt-4 flex items-end justify-between">
        <span className="text-base font-medium">{firstName} {lastName}</span>
        {expiry && <span className="font-mono text-sm tabular-nums text-white/80">{expiry}</span>}
      </div>
    </div>
  )
}
