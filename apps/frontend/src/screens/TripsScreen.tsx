import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Footprints,
  GitBranch,
  Leaf,
  Loader2,
  Search,
  Timer,
  TrainFront,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LineBadge } from '../components/domain/LineBadge'
import { tripsService, type TripItem, type WeekStats } from '../services/trips'
import {
  bestWagon,
  findItinerary,
  LINE_BRANCHES,
  LINE_TYPE,
  lineColor,
  NETWORK,
  STATIONS,
  HUBS,
  type Itinerary,
} from '../utils/idfmNetwork'
import { useAuthStore } from '../stores/authStore'
import { useLocale } from '../hooks/useLocale'

// Mapping mode réseau → icône lucide (l'icône est retirée de NETWORK côté util)
const MODE_ICON: Record<string, LucideIcon> = {
  metro: TrainFront,
  rer: GitBranch,
  tram: ArrowLeftRight,
  transilien: Building2,
}

type Step = 'from-line' | 'from-station' | 'to-line' | 'to-station' | 'confirm'

const lineLabelOf = (line: string) => (/^M\d/.test(line) ? line.slice(1) : line)

// ─── Timeline verticale d'une station (plan de ligne) ──────────────────────────
function StationRow({
  station,
  idx,
  total,
  c,
  connections,
}: {
  station: string
  idx: number
  total: number
  c: string
  connections: string[]
}) {
  const isTerminus = idx === 0 || idx === total - 1
  const hasTransfer = connections.length > 0
  const dotSize = isTerminus ? 14 : hasTransfer ? 12 : 8
  return (
    <div className="flex">
      <div className="flex w-[52px] flex-col items-center">
        <div className="w-[3px]" style={{ flex: idx === 0 ? 0 : 1, backgroundColor: c + '55' }} />
        <div
          className="z-10"
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: isTerminus || hasTransfer ? c : '#fff',
            border: `${isTerminus || hasTransfer ? 2 : 1.5}px solid ${c}`,
          }}
        />
        <div className="w-[3px]" style={{ flex: idx === total - 1 ? 0 : 1, backgroundColor: c + '55' }} />
      </div>
      <div
        className={`flex-1 pr-4 ${isTerminus ? 'py-2.5' : 'py-1.5'} ${idx < total - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
      >
        <span
          style={{
            fontSize: isTerminus ? 13 : 12,
            fontWeight: isTerminus || hasTransfer ? 700 : 500,
            color: isTerminus || hasTransfer ? '#1A2340' : '#374151',
          }}
        >
          {station}
        </span>
        {hasTransfer && (
          <div className="mt-1 flex flex-wrap gap-1">
            {connections.map((ol) => (
              <LineBadge key={ol} line={ol} size={20} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Overlay modal inline (pas de composant Modal dans le projet) ───────────────
function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white sm:max-w-2xl sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}

export default function TripsScreen() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const user = useAuthStore((s) => s.user)

  const [week, setWeek] = useState<WeekStats | null>(null)
  const [step, setStep] = useState<Step | null>('from-line')
  const [fromLine, setFromLine] = useState<string | null>(null)
  const [fromStation, setFromStation] = useState<string | null>(null)
  const [toLine, setToLine] = useState<string | null>(null)
  const [toStation, setToStation] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [logging, setLogging] = useState(false)
  const [lastLogged, setLastLogged] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState(0)
  const [history, setHistory] = useState<TripItem[] | null>(null)
  const [planLine, setPlanLine] = useState<string | null>(null)
  const [planBranchTab, setPlanBranchTab] = useState(0)
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null)

  const fetchWeek = () => {
    tripsService.getWeek().then(setWeek).catch(() => null)
  }
  const reloadHistory = () => {
    tripsService.getHistory().then(setHistory).catch(() => null)
  }
  useEffect(() => {
    if (user) fetchWeek()
  }, [user])

  useEffect(() => {
    if (activeTab === 1 && user && !history) {
      tripsService.getHistory().then(setHistory).catch(() => setHistory([]))
    }
    if (activeTab === 0 && step === null) setStep('from-line')
  }, [activeTab, user, step])

  const reset = () => {
    setStep('from-line')
    setFromLine(null)
    setFromStation(null)
    setToLine(null)
    setToStation(null)
    setSearch('')
  }

  const openModal = (preselectedLine?: string) => {
    setActiveTab(0)
    setFromLine(null)
    setFromStation(null)
    setToLine(null)
    setToStation(null)
    setSearch('')
    if (preselectedLine) {
      setFromLine(preselectedLine)
      setStep('from-station')
    } else setStep('from-line')
  }

  const openPlanLine = (line: string) => {
    setPlanLine(line)
    setPlanBranchTab(0)
  }

  const activeStations = useMemo(() => {
    const line = step === 'from-station' ? fromLine : toLine
    const base = line ? STATIONS[line] ?? [] : []
    if (!search.trim()) return base
    return base.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
  }, [step, fromLine, toLine, search])

  const itinerary = useMemo<Itinerary | null>(() => {
    if (!fromLine || !fromStation || !toLine || !toStation) return null
    return findItinerary(fromLine, fromStation, toLine, toStation)
  }, [fromLine, fromStation, toLine, toStation])

  const modalAccent =
    step?.startsWith('to') && toLine ? lineColor(toLine) : fromLine ? lineColor(fromLine) : '#1A73E8'

  const handleConfirm = async () => {
    if (!fromLine || !fromStation || !toLine || !toStation || !itinerary) return
    setLogging(true)
    const now = new Date().toTimeString().slice(0, 5)
    const arr = new Date(Date.now() + itinerary.duration * 60000).toTimeString().slice(0, 5)
    try {
      await tripsService.log({
        line: fromLine,
        toLine,
        lineType: LINE_TYPE[fromLine] ?? 'metro',
        from: fromStation,
        to: toStation,
        departureTime: now,
        arrivalTime: arr,
        duration: itinerary.duration,
        zones: [1],
        itineraryData: itinerary,
        co2Saved: itinerary.legs.reduce((a, l) => a + l.stops * 150, 0),
      })
      setLastLogged(t('trips.logged'))
      setHistory(null)
      reset()
      fetchWeek()
      reloadHistory()
    } catch {
      setLastLogged(null)
    } finally {
      setLogging(false)
    }
  }

  const stepsProgress: { key: Step; label: string }[] = [
    { key: 'from-line', label: t('trips.from') },
    { key: 'to-line', label: t('trips.to') },
    { key: 'confirm', label: t('trips.validate') },
  ]
  const stepIdx =
    step === 'from-line' || step === 'from-station' ? 0 : step === 'to-line' || step === 'to-station' ? 1 : 2

  // Pour chaque station d'une ligne, liste les autres lignes qui s'y connectent (via HUBS)
  const lineTransfers = useMemo(() => {
    if (!planLine) return new Map<string, string[]>()
    const result = new Map<string, string[]>()
    for (const hub of HUBS) {
      if (!(planLine in hub)) continue
      const stationName = hub[planLine]
      const others = Object.keys(hub).filter((k) => !k.startsWith('_') && k !== planLine)
      if (others.length > 0) result.set(stationName, others)
    }
    return result
  }, [planLine])

  // Groupe l'historique par date
  const historyByDate = useMemo(() => {
    if (!history) return []
    const seen = new Map<string, TripItem[]>()
    for (const trip of history) {
      if (!seen.has(trip.tripDate)) seen.set(trip.tripDate, [])
      seen.get(trip.tripDate)!.push(trip)
    }
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const groups: { date: string; label: string; trips: TripItem[] }[] = []
    for (const [date, trips] of seen) {
      const label =
        date === today
          ? t('trips.today')
          : date === yesterday
            ? t('trips.yesterday')
            : new Date(date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
      groups.push({ date, label, trips })
    }
    return groups
  }, [history, t, locale])

  const stopsLabel = (n: number) => t('trips.stops', { count: n })

  return (
    <div className="flex flex-col gap-3 pb-10">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">{t('trips.kicker')}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{t('trips.title')}</h1>
      </header>

      {/* Stats semaine */}
      {week && (
        <div className="mt-1 flex gap-2">
          {[
            { v: `${week.weekTrips}`, label: t('trips.stats.trips'), color: '#1A73E8' },
            { v: `${week.weekKm}km`, label: t('trips.stats.km'), color: '#0D47A1' },
            { v: `${week.weekCo2Saved}g`, label: t('trips.stats.co2'), color: '#2E7D32' },
            { v: `${week.streak}`, label: t('trips.stats.streak'), color: '#E65100' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-1 flex-col items-center rounded-2xl border border-border-default bg-bg-elevated py-2.5"
            >
              <span className="text-sm font-black" style={{ color: s.color }}>
                {s.v}
              </span>
              <span className="text-[10px] text-fg-muted">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Onglets */}
      <div className="mt-1 flex border-b border-border-default">
        {[t('trips.tabs.trip'), t('trips.tabs.history'), t('trips.tabs.plan')].map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`flex-1 border-b-2 py-3 text-center text-xs font-bold transition-colors ${
              activeTab === i ? 'border-accent text-accent' : 'border-transparent text-fg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB 0 : Trajet ── */}
      {activeTab === 0 && step !== null && (
        <div className="overflow-hidden rounded-2xl border border-border-default bg-white text-[#1A2340]">
          {/* Header du flux */}
          <div className="px-6 pb-3 pt-4">
            <div className="mb-3.5 flex items-center">
              <div className="flex-1">
                <p className="text-xl font-black text-[#1A2340]">
                  {step === 'from-line' || step === 'from-station'
                    ? t('trips.from')
                    : step === 'to-line' || step === 'to-station'
                      ? t('trips.to')
                      : t('trips.itinerary')}
                </p>
                <p className="mt-0.5 text-xs text-[#6B7A99]">
                  {step === 'from-line'
                    ? t('trips.chooseFromLine')
                    : step === 'from-station'
                      ? t('trips.chooseStation', { line: fromLine })
                      : step === 'to-line'
                        ? t('trips.chooseToLine')
                        : step === 'to-station'
                          ? t('trips.chooseStation', { line: toLine })
                          : t('trips.itineraryHint')}
                </p>
              </div>
              <button type="button" onClick={reset} aria-label="Reset" className="text-[#94A3B8]">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Barre de progression */}
            <div className="flex items-center">
              {stepsProgress.map((s, i) => {
                const done = stepIdx > i
                const active = stepIdx === i
                return (
                  <div key={s.key} className="flex items-center" style={{ flex: i < 2 ? 1 : 0 }}>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-extrabold"
                        style={{
                          backgroundColor: done ? '#22C55E' : active ? modalAccent : '#E2E8F0',
                          color: done || active ? '#fff' : '#94A3B8',
                        }}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <span
                        className="text-[11px]"
                        style={{ fontWeight: active ? 700 : 500, color: active ? '#1A2340' : '#94A3B8' }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className="mx-1.5 h-0.5 flex-1"
                        style={{ backgroundColor: done ? '#22C55E' : '#E2E8F0' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Recap départ/arrivée */}
            {(fromStation || toStation) && step !== 'confirm' && (
              <div className="mt-2.5 flex gap-1.5">
                {fromLine && fromStation && (
                  <div
                    className="flex flex-1 items-center gap-1.5 rounded-[10px] p-2"
                    style={{ backgroundColor: lineColor(fromLine) + '14' }}
                  >
                    <LineBadge line={fromLine} size={22} />
                    <span
                      className="flex-1 truncate text-[10px] font-bold"
                      style={{ color: lineColor(fromLine) }}
                    >
                      {fromStation}
                    </span>
                  </div>
                )}
                {toLine && toStation && (
                  <div
                    className="flex flex-1 items-center gap-1.5 rounded-[10px] p-2"
                    style={{ backgroundColor: lineColor(toLine) + '14' }}
                  >
                    <LineBadge line={toLine} size={22} />
                    <span className="flex-1 truncate text-[10px] font-bold" style={{ color: lineColor(toLine) }}>
                      {toStation}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Choix de ligne */}
          {(step === 'from-line' || step === 'to-line') && (
            <div className="max-h-[60vh] overflow-y-auto pb-8">
              {NETWORK.map(({ mode, lineType, lines }) => {
                const Icon = MODE_ICON[lineType] ?? TrainFront
                return (
                  <div key={mode} className="mt-4">
                    <div className="mb-2.5 flex items-center gap-1.5 px-6">
                      <Icon className="h-3.5 w-3.5 text-[#6B7A99]" aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-wide text-[#6B7A99]">{mode}</span>
                    </div>
                    {lines.map((line) => {
                      const c = lineColor(line)
                      const stations = STATIONS[line] ?? []
                      const terminus1 = stations[0] ?? ''
                      const terminus2 = stations[stations.length - 1] ?? ''
                      return (
                        <button
                          key={line}
                          type="button"
                          onClick={() => {
                            setSearch('')
                            if (step === 'from-line') {
                              setFromLine(line)
                              setStep('from-station')
                            } else {
                              setToLine(line)
                              setStep('to-station')
                            }
                          }}
                          className="mx-4 mb-2 flex w-[calc(100%-2rem)] items-center gap-2.5 overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-left"
                        >
                          <LineBadge line={line} size={32} />
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                              <span className="h-[3px] flex-1 rounded-sm" style={{ backgroundColor: c }} />
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                            </div>
                            <div className="mt-1 flex justify-between">
                              <span className="max-w-[45%] truncate text-[9px] font-bold text-[#374151]">
                                {terminus1}
                              </span>
                              <span className="max-w-[45%] truncate text-right text-[9px] font-bold text-[#374151]">
                                {terminus2}
                              </span>
                            </div>
                          </div>
                          <span
                            className="rounded-lg px-2 py-0.5 text-[10px] font-bold"
                            style={{ backgroundColor: c + '18', color: c }}
                          >
                            {stations.length} {t('trips.stations')}
                          </span>
                          <ChevronRight className="h-4 w-4 text-[#CBD5E1]" aria-hidden="true" />
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {/* Choix de station */}
          {(step === 'from-station' || step === 'to-station') && (
            <>
              <div className="px-6 pb-2">
                <div className="flex items-center gap-2 rounded-[14px] bg-[#F1F4FA] px-3.5 py-2.5">
                  <Search className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('trips.searchStation')}
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-[#1A2340] outline-none placeholder:text-[#94A3B8]"
                  />
                  {search.length > 0 && (
                    <button type="button" onClick={() => setSearch('')} className="text-[#94A3B8]">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStep(step === 'from-station' ? 'from-line' : 'to-line')
                  }}
                  className="mt-2 text-xs text-[#6B7A99]"
                >
                  ← {t('trips.changeLine')}
                </button>
              </div>
              <div className="max-h-[55vh] overflow-y-auto">
                {activeStations.map((station) => {
                  const line = step === 'from-station' ? fromLine : toLine
                  const c = line ? lineColor(line) : '#1A73E8'
                  return (
                    <button
                      key={station}
                      type="button"
                      onClick={() => {
                        setSearch('')
                        if (step === 'from-station') {
                          setFromStation(station)
                          setStep('to-line')
                        } else {
                          setToStation(station)
                          setStep('confirm')
                        }
                      }}
                      className="flex w-full items-center gap-3 border-b border-[#F1F4FA] px-6 py-3 text-left"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                      <span className="flex-1 text-sm text-[#1A2340]">{station}</span>
                      <ChevronRight className="h-4 w-4 text-[#CBD5E1]" aria-hidden="true" />
                    </button>
                  )
                })}
                <div className="h-10" />
              </div>
            </>
          )}

          {/* Confirmation */}
          {step === 'confirm' && itinerary && fromLine && fromStation && toLine && toStation && (
            <div className="max-h-[60vh] overflow-y-auto px-6 pb-12">
              <div className="mb-4 flex gap-2">
                {[
                  {
                    v:
                      itinerary.transfers.length === 0
                        ? t('trips.direct')
                        : `${itinerary.transfers.length} ${t('trips.transfers')}`,
                    label: t('trips.tabs.trip'),
                    color: itinerary.transfers.length === 0 ? '#22C55E' : '#F59E0B',
                  },
                  { v: `~${itinerary.duration} min`, label: t('trips.duration'), color: '#1A73E8' },
                  { v: '+15 pts', label: t('trips.points'), color: '#640082' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-1 flex-col items-center rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] py-3"
                  >
                    <span className="text-[13px] font-extrabold" style={{ color: s.color }}>
                      {s.v}
                    </span>
                    <span className="mt-0.5 text-[9px] text-[#94A3B8]">{s.label}</span>
                  </div>
                ))}
              </div>
              {itinerary.legs.map((leg, i) => {
                const c = lineColor(leg.line)
                return (
                  <div key={i}>
                    <div className="flex gap-3">
                      <div className="flex w-8 flex-col items-center">
                        <div
                          className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[9px] font-black text-white"
                          style={{
                            backgroundColor: c,
                            fontSize: lineLabelOf(leg.line).length > 2 ? 8 : 11,
                          }}
                        >
                          {lineLabelOf(leg.line)}
                        </div>
                        <div className="mt-1 w-0.5 flex-1" style={{ backgroundColor: c + '55' }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 py-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full border-2 border-white"
                            style={{ backgroundColor: c }}
                          />
                          <span className="flex-1 text-sm font-extrabold text-[#1A2340]">{leg.from}</span>
                        </div>
                        {leg.intermediate.map((stop, si) => (
                          <div key={si} className="flex items-center gap-2 py-1">
                            <span className="ml-0.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c + '66' }} />
                            <span className="text-xs text-[#6B7A99]">{stop}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 py-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-sm border-2 border-white"
                            style={{ backgroundColor: c }}
                          />
                          <span className="flex-1 text-sm font-extrabold text-[#1A2340]">{leg.to}</span>
                          <span
                            className="rounded-lg px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ backgroundColor: c + '20', color: c }}
                          >
                            {stopsLabel(leg.stops)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {i < itinerary.legs.length - 1 &&
                      (() => {
                        const tr = itinerary.transfers[i]
                        const nextLeg = itinerary.legs[i + 1]
                        const nextColor = lineColor(nextLeg.line)
                        const namesDiffer = tr.fromStation !== tr.toStation
                        const isWalk = tr.isWalk || namesDiffer
                        const wagon = bestWagon(leg.line, leg.from, tr.fromStation)
                        const positions: ('avant' | 'milieu' | 'arrière')[] = ['avant', 'milieu', 'arrière']
                        const labels = { avant: '1er wagon', milieu: 'Wagon central', arrière: 'Dernier wagon' }
                        return (
                          <div className="my-1 flex gap-3">
                            <div className="flex w-8 justify-center">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px]"
                                style={{
                                  backgroundColor: isWalk ? '#FFF3E0' : '#F0FFF4',
                                  borderColor: isWalk ? '#FFCC80' : '#86EFAC',
                                }}
                              >
                                {isWalk ? (
                                  <Footprints className="h-4 w-4" style={{ color: '#E65100' }} aria-hidden="true" />
                                ) : (
                                  <ArrowLeftRight
                                    className="h-4 w-4"
                                    style={{ color: '#15803D' }}
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                            </div>
                            <div
                              className="flex-1 rounded-xl border px-3 py-2.5"
                              style={{
                                backgroundColor: isWalk ? '#FFF8F0' : '#F0FFF4',
                                borderColor: isWalk ? '#FFCC80' : '#86EFAC',
                              }}
                            >
                              <span
                                className="text-xs font-extrabold"
                                style={{ color: isWalk ? '#E65100' : '#15803D' }}
                              >
                                {isWalk ? t('trips.transferWalk') : t('trips.transfer')}
                              </span>
                              {namesDiffer ? (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span
                                    className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                                    style={{ backgroundColor: lineColor(leg.line) + '22', color: lineColor(leg.line) }}
                                  >
                                    {tr.fromStation}
                                  </span>
                                  <span className="text-[11px] text-[#6B7A99]">→</span>
                                  <span
                                    className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                                    style={{ backgroundColor: nextColor + '22', color: nextColor }}
                                  >
                                    {tr.toStation}
                                  </span>
                                </div>
                              ) : (
                                <p className="mt-0.5 text-[11px] text-[#374151]">
                                  {tr.label ?? tr.fromStation} · {nextLeg.line}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex gap-[3px]">
                                  {positions.map((p) => (
                                    <div
                                      key={p}
                                      className="flex h-[13px] w-[22px] items-center justify-center rounded-[3px] border"
                                      style={{
                                        backgroundColor: wagon === p ? c : '#E2E8F0',
                                        borderColor: wagon === p ? c : '#CBD5E1',
                                      }}
                                    >
                                      {wagon === p && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-[10px] font-bold" style={{ color: c }}>
                                  → {labels[wagon]}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                  </div>
                )
              })}
              <div className="mt-4 flex gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                <span className="flex-1 text-xs text-[#6B7A99]">
                  {stopsLabel(itinerary.legs.reduce((a, l) => a + l.stops, 0))} · {itinerary.transfers.length}{' '}
                  {t('trips.transfers')}
                </span>
                <span className="flex items-center gap-1">
                  <Leaf className="h-3 w-3" style={{ color: '#22C55E' }} aria-hidden="true" />
                  <span className="text-xs font-bold" style={{ color: '#22C55E' }}>
                    {itinerary.legs.reduce((a, l) => a + l.stops, 0) * 150}g CO₂
                  </span>
                </span>
              </div>
              {lastLogged && (
                <div className="mt-3.5 flex items-center justify-center gap-1.5 rounded-[14px] border border-[#86EFAC] bg-[#F0FFF4] p-3">
                  <CheckCircle2 className="h-4 w-4" style={{ color: '#15803D' }} aria-hidden="true" />
                  <span className="text-center text-xs font-semibold text-[#15803D]">{lastLogged}</span>
                </div>
              )}
              <div className="mt-3.5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setStep('from-line')}
                  className="text-[13px] text-[#6B7A99] underline"
                >
                  {t('trips.modify')}
                </button>
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={logging}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#1A73E8] py-4 text-base font-black text-white disabled:opacity-70"
              >
                {logging ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <span>{t('trips.validate')} →</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1 : Historique ── */}
      {activeTab === 1 && (
        <div className="pt-2">
          {history === null ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
            </div>
          ) : historyByDate.length === 0 ? (
            <div className="mt-12 flex flex-col items-center">
              <TrainFront className="mb-3 h-10 w-10 text-[#CBD5E1]" aria-hidden="true" />
              <p className="mb-1 text-[15px] font-bold text-fg">{t('trips.emptyHistory')}</p>
              <p className="text-center text-[13px] text-fg-muted">{t('trips.emptyHistoryHint')}</p>
            </div>
          ) : (
            historyByDate.map(({ date, label, trips: dayTrips }) => (
              <div key={date} className="mb-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">{label}</p>
                <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
                  {dayTrips.map((trip, i) => {
                    const c = lineColor(trip.line)
                    return (
                      <button
                        key={trip.id}
                        type="button"
                        onClick={() => setSelectedTrip(trip)}
                        className={`flex w-full items-center gap-3 px-3.5 py-3 text-left ${
                          i > 0 ? 'border-t border-[#F1F5F9]' : ''
                        }`}
                      >
                        <LineBadge line={trip.line} size={38} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-[#1A2340]">{trip.from}</p>
                          <p className="text-[11px] text-[#6B7A99]">→ {trip.to}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-semibold text-[#374151]">{trip.departureTime}</span>
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ backgroundColor: c + '22', color: c }}
                          >
                            {trip.duration} min
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#CBD5E1]" aria-hidden="true" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2 : Plan ── */}
      {activeTab === 2 && (
        <div className="pb-8">
          {NETWORK.map(({ mode, lineType, lines }) => {
            const Icon = MODE_ICON[lineType] ?? TrainFront
            return (
              <div key={mode} className="mt-5">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-fg-muted" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wide text-fg-muted">{mode}</span>
                </div>
                {lines.map((line) => {
                  const c = lineColor(line)
                  const stations = STATIONS[line] ?? []
                  const terminus1 = stations[0] ?? ''
                  const terminus2 = stations[stations.length - 1] ?? ''
                  return (
                    <button
                      key={line}
                      type="button"
                      onClick={() => openPlanLine(line)}
                      className="mb-2 flex w-full items-center gap-2.5 overflow-hidden rounded-[14px] border border-border-default bg-white px-3.5 py-2.5 text-left"
                    >
                      <LineBadge line={line} size={32} />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                          <span className="h-[3px] flex-1 rounded-sm" style={{ backgroundColor: c }} />
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="max-w-[45%] truncate text-[9px] font-bold text-[#374151]">
                            {terminus1}
                          </span>
                          <span className="max-w-[45%] truncate text-right text-[9px] font-bold text-[#374151]">
                            {terminus2}
                          </span>
                        </div>
                      </div>
                      <span
                        className="rounded-lg px-2 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: c + '18', color: c }}
                      >
                        {stations.length} {t('trips.stations')}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#CBD5E1]" aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL DÉTAIL TRAJET ── */}
      {selectedTrip &&
        (() => {
          const trip = selectedTrip
          const c = lineColor(trip.line)
          const itData =
            trip.itineraryData ?? findItinerary(trip.line, trip.from, trip.toLine ?? trip.line, trip.to)
          return (
            <ModalOverlay onClose={() => setSelectedTrip(null)}>
              {/* Header coloré */}
              <div
                className="px-6 pb-4 pt-3.5"
                style={{ backgroundColor: c, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded bg-white/40" />
                <div className="flex items-center gap-3">
                  <LineBadge line={trip.line} size={44} />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-white/80">
                      {new Date(trip.tripDate).toLocaleDateString(locale, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                    <p className="mt-px truncate text-base font-black text-white">
                      {trip.from} → {trip.to}
                    </p>
                  </div>
                  <button type="button" onClick={() => setSelectedTrip(null)} aria-label="Close" className="text-white/70">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto">
                {/* Stats */}
                <div className="flex gap-2 px-5 pb-2 pt-4">
                  {[
                    {
                      Icon: Clock,
                      color: '#1A73E8',
                      v: `${trip.departureTime} → ${trip.arrivalTime}`,
                      label: t('trips.schedule'),
                    },
                    { Icon: Timer, color: '#7C3AED', v: `${trip.duration} min`, label: t('trips.duration') },
                    {
                      Icon: Leaf,
                      color: '#16A34A',
                      v: `${Math.round(trip.co2Saved / 10)}g`,
                      label: t('trips.co2Saved'),
                    },
                  ].map((s, si) => (
                    <div
                      key={si}
                      className="flex flex-1 flex-col items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5"
                    >
                      <s.Icon className="h-[18px] w-[18px]" style={{ color: s.color }} aria-hidden="true" />
                      <span className="mt-1 text-[11px] font-extrabold text-[#1A2340]">{s.v}</span>
                      <span className="text-[9px] text-[#94A3B8]">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Itinéraire détaillé */}
                <div className="px-5 py-3">
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-[#6B7A99]">
                    {t('trips.tripDetail')}
                  </p>
                  {itData.legs.map((leg, i) => {
                    const lc = lineColor(leg.line)
                    return (
                      <div key={i}>
                        <div className="flex gap-3">
                          <div className="flex w-7 flex-col items-center">
                            <LineBadge line={leg.line} size={28} />
                            {(leg.intermediate.length > 0 || i < itData.legs.length - 1) && (
                              <div className="mt-1 w-0.5 flex-1" style={{ backgroundColor: lc + '44' }} />
                            )}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center gap-2 py-1.5">
                              <span
                                className="h-[9px] w-[9px] rounded-full border-[1.5px] border-white"
                                style={{ backgroundColor: lc }}
                              />
                              <span className="flex-1 text-[13px] font-extrabold text-[#1A2340]">{leg.from}</span>
                            </div>
                            {leg.intermediate.map((stop, si) => (
                              <div key={si} className="flex items-center gap-2 py-0.5">
                                <span
                                  className="ml-0.5 h-[5px] w-[5px] rounded-full"
                                  style={{ backgroundColor: lc + '66' }}
                                />
                                <span className="text-[11px] text-[#8896B0]">{stop}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 py-1.5">
                              <span
                                className="h-[9px] w-[9px] rounded-sm border-[1.5px] border-white"
                                style={{ backgroundColor: lc }}
                              />
                              <span className="flex-1 text-[13px] font-extrabold text-[#1A2340]">{leg.to}</span>
                              <span
                                className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                                style={{ backgroundColor: lc + '20', color: lc }}
                              >
                                {stopsLabel(leg.stops)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {i < itData.legs.length - 1 &&
                          (() => {
                            const tr = itData.transfers[i]
                            const isWalk = tr.isWalk || tr.fromStation !== tr.toStation
                            const wagon = bestWagon(leg.line, leg.from, tr.fromStation)
                            const positions: ('avant' | 'milieu' | 'arrière')[] = ['avant', 'milieu', 'arrière']
                            const labels = { avant: '1er wagon', milieu: 'Wagon central', arrière: 'Dernier wagon' }
                            return (
                              <div className="my-0.5 flex gap-3">
                                <div className="flex w-7 justify-center">
                                  <div
                                    className="flex h-7 w-7 items-center justify-center rounded-full border"
                                    style={{
                                      backgroundColor: isWalk ? '#FFF3E0' : '#F0FFF4',
                                      borderColor: isWalk ? '#FFCC80' : '#86EFAC',
                                    }}
                                  >
                                    {isWalk ? (
                                      <Footprints
                                        className="h-3.5 w-3.5"
                                        style={{ color: '#E65100' }}
                                        aria-hidden="true"
                                      />
                                    ) : (
                                      <ArrowLeftRight
                                        className="h-3.5 w-3.5"
                                        style={{ color: '#15803D' }}
                                        aria-hidden="true"
                                      />
                                    )}
                                  </div>
                                </div>
                                <div
                                  className="flex-1 rounded-[10px] border px-2.5 py-1.5"
                                  style={{
                                    backgroundColor: isWalk ? '#FFF8F0' : '#F0FFF4',
                                    borderColor: isWalk ? '#FFCC80' : '#86EFAC',
                                  }}
                                >
                                  <span
                                    className="text-[11px] font-bold"
                                    style={{ color: isWalk ? '#E65100' : '#15803D' }}
                                  >
                                    {isWalk
                                      ? `${t('trips.transferWalk')} · ${
                                          tr.fromStation !== tr.toStation
                                            ? tr.fromStation + ' → ' + tr.toStation
                                            : tr.fromStation
                                        }`
                                      : `${t('trips.transfer')} · ${tr.fromStation}`}
                                  </span>
                                  <div className="mt-1.5 flex items-center gap-1.5">
                                    <div className="flex gap-0.5">
                                      {positions.map((p) => (
                                        <div
                                          key={p}
                                          className="flex h-[11px] w-[18px] items-center justify-center rounded-sm border"
                                          style={{
                                            backgroundColor: wagon === p ? lc : '#E2E8F0',
                                            borderColor: wagon === p ? lc : '#CBD5E1',
                                          }}
                                        >
                                          {wagon === p && <span className="h-[5px] w-[5px] rounded-full bg-white" />}
                                        </div>
                                      ))}
                                    </div>
                                    <span className="text-[10px] font-bold" style={{ color: lc }}>
                                      {labels[wagon]}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                      </div>
                    )
                  })}
                </div>

                {/* Bouton refaire */}
                <div className="px-5 pb-8">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrip(null)
                      openModal(trip.line)
                    }}
                    className="w-full rounded-2xl py-3.5 text-sm font-black text-white"
                    style={{ backgroundColor: c }}
                  >
                    {t('trips.validate')} →
                  </button>
                </div>
              </div>
            </ModalOverlay>
          )
        })()}

      {/* ── MODAL PLAN LIGNE ── */}
      {planLine &&
        (() => {
          const line = planLine
          const c = lineColor(line)
          const lineLabel = lineLabelOf(line)
          const stations = STATIONS[line] ?? []
          const branchTabs = LINE_BRANCHES[line]
          const displayStations = branchTabs
            ? branchTabs[planBranchTab]?.buildStations(stations) ?? stations
            : stations
          return (
            <ModalOverlay onClose={() => setPlanLine(null)}>
              {/* Header */}
              <div
                className="px-6 pb-4 pt-3.5"
                style={{ backgroundColor: c, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
              >
                <div className="mx-auto mb-3.5 h-1 w-10 rounded bg-white/35" />
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-white/20 font-black text-white"
                    style={{ fontSize: lineLabel.length > 2 ? 12 : 18 }}
                  >
                    {lineLabel}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-white/75">{t('trips.allStations')}</span>
                    <p className="truncate text-[15px] font-black text-white">
                      {stations[0]} → {stations[stations.length - 1]}
                    </p>
                  </div>
                  <span className="rounded-[10px] bg-white/20 px-2.5 py-1 text-xs font-extrabold text-white">
                    {stations.length} {t('trips.stations')}
                  </span>
                  <button type="button" onClick={() => setPlanLine(null)} aria-label="Close" className="ml-1 text-white/70">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Onglets branches */}
              {branchTabs && (
                <div className="flex border-b border-[#E2E8F0] bg-white">
                  {branchTabs.map((tab, ti) => (
                    <button
                      key={ti}
                      type="button"
                      onClick={() => setPlanBranchTab(ti)}
                      className="flex-1 border-b-2 px-1 py-2.5 text-center text-[10px] font-bold"
                      style={{
                        borderBottomColor: planBranchTab === ti ? c : 'transparent',
                        color: planBranchTab === ti ? c : '#94A3B8',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Liste des stations */}
              <div className="overflow-y-auto py-3">
                {displayStations.map((station, idx) => (
                  <StationRow
                    key={`${planBranchTab}-${idx}`}
                    station={station}
                    idx={idx}
                    total={displayStations.length}
                    c={c}
                    connections={lineTransfers.get(station) ?? []}
                  />
                ))}
                <div className="h-8" />
              </div>
            </ModalOverlay>
          )
        })()}
    </div>
  )
}
