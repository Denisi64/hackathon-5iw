import { useState } from 'react'
import { Link } from 'react-router-dom'

const MILESTONES = [
  ['Naissance', 'Creation du dossier par le representant legal.'],
  ['Junior', 'Imagine R Junior accompagne les premiers trajets.'],
  ['Scolaire', 'Certificat de scolarite et renouvellement annuel.'],
  ['16 ans', 'Le porteur peut demander a gerer son propre contrat.'],
  ['Etudiant', 'Imagine R Etudiant, avec verification possible du statut.'],
  ['Adulte', 'Navigo Annuel ou Liberte+ selon la frequence.'],
  ['62 ans', 'Bascule proposee vers Navigo Senior.'],
] as const

export function TimelineScreen() {
  const [activeIndex, setActiveIndex] = useState(3)
  const active = MILESTONES[activeIndex]

  return (
    <main className="screen">
      <section className="panel" aria-labelledby="timeline-title">
        <span className="eyebrow">Cycle de vie</span>
        <h1 id="timeline-title">Une vie de titres, rendue lisible.</h1>
        <div className="timeline" role="list">
          {MILESTONES.map(([title], index) => (
            <button
              className={index === activeIndex ? 'timeline__item timeline__item--active' : 'timeline__item'}
              key={title}
              onClick={() => setActiveIndex(index)}
              role="listitem"
              type="button"
            >
              <span>{index + 1}</span>
              <strong>{title}</strong>
            </button>
          ))}
        </div>
        <article className="timeline-detail" aria-live="polite">
          <h2>{active[0]}</h2>
          <p>{active[1]}</p>
          <Link className="button button--primary button--md" to="/souscrire">
            Demarrer une souscription
          </Link>
        </article>
      </section>
    </main>
  )
}
