import { ArrowRight, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TarifResultat } from '../../types/domain'
import { formatCurrency } from '../../utils/format'

interface ForfaitCardProps {
  resultat: TarifResultat
  compact?: boolean
}

export function ForfaitCard({ resultat, compact = false }: ForfaitCardProps) {
  const { forfait, prixAnnuel, economieVsTickets, recommended, conseil } = resultat

  return (
    <article className={`forfait-card ${recommended ? 'forfait-card--recommended' : ''}`}>
      <div className="forfait-card__header">
        <div>
          {recommended && (
            <span className="badge badge--success">
              <BadgeCheck aria-hidden="true" />
              Recommande
            </span>
          )}
          <h3>{forfait.nom}</h3>
        </div>
        <strong>{Number.isFinite(prixAnnuel) ? formatCurrency(prixAnnuel) : 'Selon dossier'}</strong>
      </div>
      {!compact && <p>{forfait.description}</p>}
      <div className="forfait-card__meta">
        <span>{forfait.renouvellement}</span>
        <span>{forfait.justificatifsRequis.length === 0 ? 'Sans justificatif' : 'Justificatif requis'}</span>
        <span>{economieVsTickets > 0 ? `${formatCurrency(economieVsTickets)} economises` : 'Prix optimise'}</span>
      </div>
      <p className="forfait-card__tip">{conseil}</p>
      <Link className="button button--primary button--md" to={`/souscrire?forfait=${forfait.id}`}>
        Choisir <ArrowRight aria-hidden="true" />
      </Link>
    </article>
  )
}
