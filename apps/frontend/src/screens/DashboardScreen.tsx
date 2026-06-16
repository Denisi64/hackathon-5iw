import { AlertCircle, Bell, FileText, RotateCw } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function DashboardScreen() {
  return (
    <main className="screen dashboard" aria-labelledby="dashboard-title">
      <section className="panel">
        <span className="eyebrow">
          <Bell aria-hidden="true" />
          Espace client
        </span>
        <h1 id="dashboard-title">Votre abonnement actif.</h1>
        <article className="active-pass">
          <div>
            <strong>Navigo Annuel</strong>
            <span>Zones 1 a 5</span>
          </div>
          <div>
            <strong>12/09/2026</strong>
            <span>Echeance</span>
          </div>
          <Button size="sm">
            <RotateCw aria-hidden="true" />
            Renouveler
          </Button>
        </article>
      </section>

      <section className="panel">
        <h2>Statut du dossier</h2>
        <ol className="status-stepper">
          {['Soumis', 'En cours', 'Valide', 'Carte envoyee'].map((status, index) => (
            <li className={index < 3 ? 'status-stepper__item status-stepper__item--done' : 'status-stepper__item'} key={status}>
              <span>{index + 1}</span>
              {status}
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h2>Documents</h2>
        <div className="document-list">
          <div>
            <FileText aria-hidden="true" />
            <span>Piece d'identite</span>
            <strong>Valide</strong>
          </div>
          <div>
            <AlertCircle aria-hidden="true" />
            <span>Attestation employeur</span>
            <strong>A fournir</strong>
          </div>
        </div>
      </section>
    </main>
  )
}
