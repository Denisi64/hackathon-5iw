import { Activity, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

type HealthResponse = {
  status: 'ok'
  service: string
  timestamp: string
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<HealthResponse>
      })
      .then(setHealth)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      })
  }, [])

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="brand">Comutitres</div>
        <h1 id="page-title">Socle hackathon pret a coder</h1>
        <p>
          Front React, backend NestJS, PostgreSQL et MinIO sont prets pour lancer
          le MVP de souscription.
        </p>
        <div className="status-list" aria-label="Etat des services">
          <article className="status-card">
            <Activity aria-hidden="true" />
            <span>Frontend Vite</span>
            <strong>OK</strong>
          </article>
          <article className="status-card">
            <ShieldCheck aria-hidden="true" />
            <span>Backend NestJS</span>
            <strong>{health ? 'OK' : error ? 'KO' : '...'}</strong>
          </article>
        </div>
        {health && <small>Dernier healthcheck: {new Date(health.timestamp).toLocaleString('fr-FR')}</small>}
        {error && <small role="alert">API indisponible: {error}</small>}
      </section>
    </main>
  )
}
