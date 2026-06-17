import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Orb } from '../components/ui/Orb'
import { Modal } from '../components/ui/Modal'
import { GlossaryTooltip } from '../components/domain/GlossaryTooltip'
import { LIFE_MILESTONES, LIFE_ALTERNATIVES, type Milestone } from '../data/lifeTimeline'
import { FORFAITS } from '../utils/tarifsData'
import { formatCurrency } from '../lib/formatters'
import { useLocale } from '../hooks/useLocale'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { cn } from '../lib/cn'

export default function TimelineScreen() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Milestone | null>(null)

  return (
    <div className="flex flex-col gap-16 pb-10">
      {/* HERO */}
      <header className="flex flex-col items-start gap-3">
        <span className="font-mono text-xs tracking-widest uppercase text-fg-muted">{t('timeline.kicker')}</span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
          <span className="bg-gradient-to-b from-fg via-fg to-fg/60 bg-clip-text text-transparent">
            {t('timeline.title')}
          </span>
        </h1>
        <p className="max-w-2xl text-base text-fg-muted">{t('timeline.subtitle')}</p>
      </header>

      {/* PARCOURS PRINCIPAL */}
      <section>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {LIFE_MILESTONES.map((m, i) => (
            <MilestoneNode key={m.id} milestone={m} index={i} order={i + 1} onOpen={setSelected} />
          ))}
        </ol>
      </section>

      {/* ALTERNATIVES */}
      <section>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-fg">{t('timeline.alternatives.title')}</h2>
          <p className="text-sm text-fg-muted">{t('timeline.alternatives.subtitle')}</p>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LIFE_ALTERNATIVES.map((m, i) => (
            <MilestoneNode key={m.id} milestone={m} index={i} onOpen={setSelected} />
          ))}
        </ol>
      </section>

      <MilestoneModal milestone={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function MilestoneNode({ milestone, index, order, onOpen }: {
  milestone: Milestone
  index: number
  order?: number
  onOpen: (m: Milestone) => void
}) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLLIElement>(null)
  const [visible, setVisible] = useState(reduced)

  // Le jalon s'allume quand il entre dans le viewport (scroll reveal).
  useEffect(() => {
    if (reduced) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [reduced])

  const Icon = milestone.icon
  const forfait = milestone.forfaitId ? FORFAITS.find((f) => f.id === milestone.forfaitId) : undefined

  return (
    <li
      ref={ref}
      style={{ transitionDelay: visible && !reduced ? `${index * 80}ms` : '0ms' }}
      className={cn(
        'transition-all duration-500 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(milestone)}
        className={cn(
          'group h-full w-full text-left rounded-2xl border border-border-default bg-bg-elevated p-5 shadow-card',
          'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <Orb value={<Icon className="h-5 w-5" aria-hidden="true" />} label="" color={milestone.color} size="md" />
          {order !== undefined && (
            <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">
              {String(order).padStart(2, '0')}
            </span>
          )}
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight text-fg leading-snug">
          {t(`timeline.milestones.${milestone.id}.title`)}
        </h3>
        <p className="mt-1 text-xs font-medium text-fg-muted">{t(`timeline.milestones.${milestone.id}.age`)}</p>
        {forfait && forfait.prixAn !== null && (
          <p className="mt-3 text-sm font-semibold tracking-tight text-fg tabular-nums">
            {formatCurrency(forfait.prixAn, locale)}
            <span className="font-normal text-fg-muted">{t('simulator.perYear')}</span>
          </p>
        )}
      </button>
    </li>
  )
}

function MilestoneModal({ milestone, onClose }: { milestone: Milestone | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const navigate = useNavigate()

  const forfait = milestone?.forfaitId ? FORFAITS.find((f) => f.id === milestone.forfaitId) : undefined

  function subscribe() {
    if (!forfait) return
    onClose()
    navigate(`/souscrire?forfait=${forfait.id}&zones=${forfait.zones.max}`)
  }

  return (
    <Modal
      open={milestone !== null}
      onClose={onClose}
      closeLabel={t('timeline.close')}
      title={milestone ? t(`timeline.milestones.${milestone.id}.title`) : undefined}
    >
      {milestone && (
        <div className="flex flex-col gap-5">
          <p className="text-fg-muted leading-relaxed">{t(`timeline.milestones.${milestone.id}.description`)}</p>

          {forfait ? (
            <>
              <div className="rounded-xl bg-surface border border-border-default p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-fg">{forfait.nom}</h3>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      {t('timeline.zones', { min: forfait.zones.min, max: forfait.zones.max })}
                    </p>
                  </div>
                  {forfait.prixAn !== null && (
                    <div className="text-right">
                      <p className="text-xl font-semibold tracking-tight text-fg tabular-nums">
                        {formatCurrency(forfait.prixAn, locale)}
                        <span className="text-xs font-normal text-fg-muted">{t('simulator.perYear')}</span>
                      </p>
                      {forfait.prixMois !== null && (
                        <p className="text-xs text-fg-muted tabular-nums">
                          {formatCurrency(forfait.prixMois, locale)}{t('simulator.perMonth')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button size="md" onClick={subscribe} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                {t('timeline.cta')}
              </Button>
            </>
          ) : (
            // Jalon de transition (ex. 16 ans) — pas de forfait, on éclaire le vocabulaire.
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface border border-border-default p-4 text-sm text-fg-muted">
              <Badge variant="info">{t(`timeline.milestones.${milestone.id}.age`)}</Badge>
              <GlossaryTooltip term="porteur" />
              <GlossaryTooltip term="payeur" />
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
