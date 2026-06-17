import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { PERSONA_STORIES, type PersonaSlug } from '../../data/personaStories'

/** Bandeau couleur signature, façon affiche officielle de la campagne. */
const POSTER_BAND: Record<'purple' | 'amber' | 'green' | 'pink' | 'blue', string> = {
  purple: 'from-purple-500 to-purple-700',
  amber: 'from-amber-400 to-amber-600',
  green: 'from-emerald-500 to-emerald-700',
  pink: 'from-pink-500 to-pink-700',
  blue: 'from-sky-500 to-blue-700',
}

export interface CampaignPosterProps {
  slug: PersonaSlug
}

export function CampaignPoster({ slug }: CampaignPosterProps) {
  const { t } = useTranslation()
  const story = PERSONA_STORIES[slug]
  const Icon = story.icon

  return (
    <Link
      to={`/histoires/${slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
      aria-label={t(`stories.personas.${slug}.name`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border-default shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover">
        <img
          src={story.photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          draggable={false}
        />
        {/* Dégradé haut pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/15 to-transparent" />

        {/* Bloc texte façon affiche */}
        <div className="absolute inset-x-0 top-0 p-4">
          <span className="font-mono text-[10px] font-medium tracking-widest uppercase text-white/80">
            {t(`stories.personas.${slug}.episode`)}
          </span>
          <h3 className="mt-1 text-2xl font-semibold uppercase leading-none tracking-tight text-white drop-shadow">
            {t(`stories.personas.${slug}.name`)}
          </h3>
          <p className="mt-2 max-w-[20ch] text-sm font-medium leading-snug text-white/90">
            {t(`stories.personas.${slug}.tagline`)}
          </p>
        </div>

        {/* Bandeau couleur signature + marque */}
        <div className={cn('absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-gradient-to-r px-3 py-2.5 text-white', POSTER_BAND[story.color])}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20 ring-1 ring-white/40">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 leading-tight">
            <span className="block text-xs font-bold tracking-tight">comutitres</span>
            <span className="block truncate text-[8px] uppercase tracking-wide text-white/85">{t('campaign.tagline')}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
