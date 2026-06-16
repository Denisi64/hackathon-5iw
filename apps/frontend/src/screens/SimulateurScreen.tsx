import { SlidersHorizontal } from 'lucide-react'
import { ForfaitCard } from '../components/domain/ForfaitCard'
import { ProfileChip } from '../components/domain/ProfileChip'
import type { NiveauZone, ProfilUsager } from '../types/domain'
import { useSimulator } from '../hooks/useSimulator'

const PROFILS: ProfilUsager[] = ['salarie', 'etudiant', 'scolaire_junior', 'scolaire', 'senior', 'tst', 'amethyste']

export function SimulateurScreen() {
  const { params, resultats, setProfil, setJoursParSemaine, setTrajetsParJour, setZones } = useSimulator()

  return (
    <main className="screen screen--split">
      <section className="panel" aria-labelledby="simulator-title">
        <span className="eyebrow">
          <SlidersHorizontal aria-hidden="true" />
          Simulateur
        </span>
        <h1 id="simulator-title">Comparez selon votre usage reel.</h1>
        <div className="chip-row" aria-label="Profil usager">
          {PROFILS.map((profil) => (
            <ProfileChip active={params.profil === profil} key={profil} onSelect={setProfil} profil={profil} />
          ))}
        </div>
        <Slider
          label="Jours par semaine"
          max={7}
          min={1}
          onChange={setJoursParSemaine}
          value={params.joursParSemaine}
        />
        <Slider
          label="Trajets par jour"
          max={10}
          min={1}
          onChange={setTrajetsParJour}
          value={params.trajetsParJour}
        />
        <Slider
          label="Zones parcourues"
          max={5}
          min={1}
          onChange={(value) => setZones(value as NiveauZone)}
          value={params.zones}
        />
      </section>

      <section className="results-stack" aria-label="Classement des abonnements">
        {resultats.length > 0 ? (
          resultats.map((resultat) => <ForfaitCard key={resultat.forfait.id} resultat={resultat} />)
        ) : (
          <article className="empty-state">
            <h2>Aucune offre directe</h2>
            <p>Un conseiller peut verifier votre situation et les aides locales disponibles.</p>
          </article>
        )}
      </section>
    </main>
  )
}

interface SliderProps {
  label: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
}

function Slider({ label, min, max, value, onChange }: SliderProps) {
  return (
    <label className="field">
      <span>
        {label}
        <strong>{value}</strong>
      </span>
      <input min={min} max={max} type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}
