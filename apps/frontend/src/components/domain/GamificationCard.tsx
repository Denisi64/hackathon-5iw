import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, Trophy } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { getGamification, progressPercent, type Gamification } from '../../services/gamification'

/** Carte de progression (points / niveau / badges). Auto-chargée ; masquée si l'appel échoue. */
export function GamificationCard() {
  const { t } = useTranslation()
  const [data, setData] = useState<Gamification | null>(null)

  useEffect(() => {
    let active = true
    getGamification()
      .then((d) => { if (active) setData(d) })
      .catch(() => { /* erreur silencieuse — section masquée */ })
    return () => { active = false }
  }, [])

  if (!data) return null

  const pct = progressPercent(data.points, data.nextLevelPoints)
  const remaining = Math.max(0, data.nextLevelPoints - data.points)

  return (
    <Card>
      <Card.Body>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-amber-400/15 text-amber-500">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('gamification.title')}</span>
              <p className="text-lg font-semibold tracking-tight text-fg">{t('gamification.level', { level: data.level })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tracking-tight text-fg tabular-nums">{data.points}</p>
            <p className="text-xs text-fg-muted">{t('gamification.points')}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full border border-border-default bg-surface">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-fg-muted">{t('gamification.toNextLevel', { points: remaining, level: data.level + 1 })}</p>
        </div>

        <div className="mt-4">
          <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">{t('gamification.badges')}</span>
          {data.badges.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {data.badges.map((b) => (
                <Badge key={b} variant="warning" icon={<Star className="h-3 w-3" aria-hidden="true" />}>{b}</Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-fg-muted">{t('gamification.noBadges')}</p>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
