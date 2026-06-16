import { ArrowRight, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PriceResult } from '../../types/domain'
import { formatCurrency } from '../../utils/format'

interface OfferCardProps {
  result: PriceResult
  compact?: boolean
}

export function OfferCard({ result, compact = false }: OfferCardProps) {
  const { offer, yearlyPrice, savingsVsTickets, recommended, advice } = result

  return (
    <article className={`offer-card ${recommended ? 'offer-card--recommended' : ''}`}>
      <div className="offer-card__header">
        <div>
          {recommended && (
            <span className="badge badge--success">
              <BadgeCheck aria-hidden="true" />
              Recommande
            </span>
          )}
          <h3>{offer.name}</h3>
        </div>
        <strong>{Number.isFinite(yearlyPrice) ? formatCurrency(yearlyPrice) : 'Selon dossier'}</strong>
      </div>
      {!compact && <p>{offer.description}</p>}
      <div className="offer-card__meta">
        <span>{offer.renewalFrequency}</span>
        <span>{offer.requiredDocuments.length === 0 ? 'Sans justificatif' : 'Justificatif requis'}</span>
        <span>{savingsVsTickets > 0 ? `${formatCurrency(savingsVsTickets)} economises` : 'Prix optimise'}</span>
      </div>
      <p className="offer-card__tip">{advice}</p>
      <Link className="button button--primary button--md" to={`/souscrire?forfait=${offer.id}`}>
        Choisir <ArrowRight aria-hidden="true" />
      </Link>
    </article>
  )
}
