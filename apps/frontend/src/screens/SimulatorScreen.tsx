import { SlidersHorizontal } from 'lucide-react'
import { OfferCard } from '../components/domain/OfferCard'
import { ProfileChip } from '../components/domain/ProfileChip'
import type { UserProfile, ZoneLevel } from '../types/domain'
import { useSimulator } from '../hooks/useSimulator'

const PROFILES: UserProfile[] = ['employee', 'student', 'junior_school', 'school', 'senior', 'solidarity', 'amethyst']

export function SimulatorScreen() {
  const { params, results, setProfile, setWeeklyUsageDays, setTripsPerDay, setZones } = useSimulator()

  return (
    <main className="screen screen--split">
      <section className="panel" aria-labelledby="simulator-title">
        <span className="eyebrow">
          <SlidersHorizontal aria-hidden="true" />
          Simulateur
        </span>
        <h1 id="simulator-title">Comparez selon votre usage reel.</h1>
        <div className="chip-row" aria-label="Profil usager">
          {PROFILES.map((profile) => (
            <ProfileChip active={params.profile === profile} key={profile} onSelect={setProfile} profile={profile} />
          ))}
        </div>
        <Slider
          label="Jours par semaine"
          max={7}
          min={1}
          onChange={setWeeklyUsageDays}
          value={params.weeklyUsageDays}
        />
        <Slider label="Trajets par jour" max={10} min={1} onChange={setTripsPerDay} value={params.tripsPerDay} />
        <Slider
          label="Zones parcourues"
          max={5}
          min={1}
          onChange={(value) => setZones(value as ZoneLevel)}
          value={params.zones}
        />
      </section>

      <section className="results-stack" aria-label="Classement des abonnements">
        {results.length > 0 ? (
          results.map((result) => <OfferCard key={result.offer.id} result={result} />)
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
