import { ArrowRight, Bot, CalendarClock, CreditCard, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function HomeScreen() {
  return (
    <main className="screen">
      <section className="hero-panel" aria-labelledby="home-title">
        <div className="hero-panel__content">
          <span className="eyebrow">Comutitres</span>
          <h1 id="home-title">Votre abonnement de transport, choisi sans detour.</h1>
          <p>
            Un parcours clair pour trouver le bon abonnement, verifier les droits utiles et
            finaliser une souscription en moins de cinq etapes.
          </p>
          <div className="hero-panel__actions">
            <Link className="button button--primary button--lg" to="/simulateur">
              Comparer les abonnements <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="button button--secondary button--lg" to="/assistant">
              Assistant IA <Bot aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="subscription-preview" aria-label="Apercu du parcours">
          <div className="subscription-preview__header">
            <strong>Dossier en cours</strong>
            <span>4 min restantes</span>
          </div>
          <div className="preview-row">
            <ShieldCheck aria-hidden="true" />
            <span>Droits verifies a la source</span>
          </div>
          <div className="preview-row">
            <CreditCard aria-hidden="true" />
            <span>Paiement CB ou prelevement</span>
          </div>
          <div className="preview-row">
            <CalendarClock aria-hidden="true" />
            <span>Renouvellement anticipe</span>
          </div>
          <Link className="button button--ghost button--md" to="/souscrire">
            Reprendre
          </Link>
        </div>
      </section>

      <section className="feature-grid" aria-label="Fonctionnalites principales">
        {[
          ['Souscription guidee', 'Profil, offre, justificatifs, paiement et confirmation.'],
          ['Verification sans upload', 'Mocks CAF et statut etudiant pour la demo hackathon.'],
          ['Accessibilite', 'Cibles tactiles larges, focus visible, vocabulaire explique.'],
          ['Espace client', 'Suivi du dossier, documents, alertes et renouvellement.'],
        ].map(([title, text]) => (
          <article className="feature-tile" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
