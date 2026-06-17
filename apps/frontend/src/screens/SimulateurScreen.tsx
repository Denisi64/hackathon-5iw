import { useTranslation } from 'react-i18next'
import { Settings2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Slider } from '../components/ui/Slider'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { ProfilSelector } from '../components/domain/ProfilSelector'
import { ComparateurForfaits } from '../components/domain/ComparateurForfaits'
import { useSimulator } from '../hooks/useSimulator'
import type { NiveauZone } from '../types/domain'

export default function SimulateurScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { params, update, results } = useSimulator()

  return (
    <div className="flex flex-col gap-12 pb-10">
      {/* Title strip */}
      <header className="flex flex-col items-start gap-3">
        <Badge variant="info" icon={<Settings2 className="h-3 w-3" aria-hidden="true" />}>
          {t('simulator.title')}
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-fg">
          <span className="bg-gradient-to-b from-fg via-fg to-fg/60 bg-clip-text text-transparent">
            {t('simulator.title')}
          </span>
        </h1>
        <p className="max-w-xl text-fg-muted">{t('simulator.subtitle')}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Configurator panel */}
        <Card className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <Card.Body>
            <ProfilSelector value={params.profil} onChange={(p) => update('profil', p)} />

            <div className="mt-8 flex flex-col gap-6">
              <Slider
                label={t('simulator.slider.days.label')}
                unit={t('simulator.slider.days.unit')}
                value={params.joursParSemaine}
                onChange={(v) => update('joursParSemaine', v)}
                min={1}
                max={7}
              />
              <Slider
                label={t('simulator.slider.zones.label')}
                unit={t('simulator.slider.zones.unit')}
                value={params.zones}
                onChange={(v) => update('zones', v as NiveauZone)}
                min={1}
                max={5}
              />
              <Slider
                label={t('simulator.slider.trips.label')}
                unit={t('simulator.slider.trips.unit')}
                value={params.trajetsParJour}
                onChange={(v) => update('trajetsParJour', v)}
                min={1}
                max={10}
              />
              <Input
                label={t('simulator.ageLabel')}
                type="number"
                inputMode="numeric"
                value={params.age ?? ''}
                onChange={(e) => update('age', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </Card.Body>
        </Card>

        {/* Results column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-fg">
              {t('simulator.results')}
            </h2>
            <span className="font-mono text-xs tracking-widest uppercase text-fg-muted">
              {results.length} / 12
            </span>
          </div>
          <ComparateurForfaits
            results={results}
            onSelect={(id) => navigate(`/forfaits/${id}`)}
          />
        </div>
      </div>
    </div>
  )
}
