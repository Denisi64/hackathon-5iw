import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, Upload, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { PERSONA_LIST, PERSONA_STORIES, type PersonaSlug } from '../data/personaStories'
import { cn } from '../lib/cn'

function isValidSlug(slug: string | undefined): slug is PersonaSlug {
  return !!slug && (PERSONA_LIST as string[]).includes(slug)
}

const STAGE_ICONS = [Sparkles, MessageCircle, Upload, Check, ArrowRight] as const

export default function StoryScreen() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!isValidSlug(slug)) return <Navigate to="/" replace />

  const story = PERSONA_STORIES[slug]
  const Icon = story.icon
  const otherPersonas = PERSONA_LIST.filter((p) => p !== slug)

  return (
    <div className="flex flex-col gap-16 pb-10">
      {/* Back link */}
      <Link
        to="/#stories"
        className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-fg transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('stories.screen.back')}
      </Link>

      {/* HERO */}
      <section className="relative">
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 -top-10 h-72 -z-10 rounded-3xl blur-3xl opacity-60 bg-gradient-to-b',
            story.fromClass,
            story.toClass,
          )}
        />
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          {/* Portrait — encadré avec ring couleur signature + icon badge. */}
          <div className="shrink-0 relative w-44 sm:w-56 md:w-64">
            <div className={cn(
              'absolute -inset-4 rounded-3xl blur-2xl opacity-50 bg-gradient-to-br',
              story.fromClass,
              story.toClass,
            )} aria-hidden="true" />
            <div className={cn(
              'relative aspect-[4/5] w-full rounded-2xl overflow-hidden ring-2 ring-inset shadow-card-hover',
              story.ringClass,
            )}>
              <img
                src={story.photo}
                alt={t(`stories.personas.${story.slug}.name`)}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              {/* Léger fondu en bas pour transition vers la card. */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg-base/40 to-transparent" />
              {/* Icon badge en bas à droite. */}
              <span className={cn(
                'absolute bottom-3 right-3 grid place-items-center h-10 w-10 rounded-full text-white shadow-card ring-2 ring-bg-base',
                story.color === 'purple' && 'bg-gradient-to-br from-purple-400 to-purple-600',
                story.color === 'amber' && 'bg-gradient-to-br from-amber-300 to-amber-500',
                story.color === 'green' && 'bg-gradient-to-br from-emerald-400 to-emerald-600',
                story.color === 'pink' && 'bg-gradient-to-br from-pink-400 to-pink-600',
              )}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">{t(`stories.personas.${story.slug}.episode`)}</Badge>
              <Badge variant="neutral">{t(`stories.personas.${story.slug}.role`)}</Badge>
              <Badge variant="neutral">{t('stories.screen.ageBadge', { age: story.age })}</Badge>
              <Badge variant="neutral">{story.location}</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-fg via-fg to-fg/60 bg-clip-text text-transparent">
                {t(`stories.personas.${story.slug}.name`)}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-fg-muted tracking-tight">
              {t(`stories.personas.${story.slug}.tagline`)}
            </p>
            <blockquote className="mt-4 max-w-2xl text-base text-fg-subtle italic">
              {t('stories.screen.quote', { text: story.quote })}
            </blockquote>
          </div>
        </div>
      </section>

      {/* EPISODES — horizontal timeline */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {story.episodes.map((episode, i) => {
            const StageIcon = STAGE_ICONS[i] ?? Sparkles
            const key = `e${i + 1}` as const
            return (
              <Card key={i} hover spotlight className={cn('flex flex-col', `ring-1 ring-inset transition-shadow`, story.ringClass)}>
                <Card.Body>
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">
                      {t(`stories.episodes.${key}.kicker`)}
                    </span>
                    <div className={cn('h-7 w-7 grid place-items-center rounded-full text-fg-muted bg-surface border border-border-default')}>
                      <StageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-fg leading-snug">
                    {t(`stories.episodes.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-fg-muted leading-relaxed">{episode.narrative}</p>

                  {/* Mock phone-screen content */}
                  <div className="mt-4 rounded-lg bg-surface border border-border-default p-3 flex flex-col gap-1.5">
                    {episode.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-fg">
                        <span className="h-1 w-1 rounded-full bg-accent shrink-0" aria-hidden="true" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Forfait highlight + CTA */}
      <section>
        <Card variant="feature" spotlight>
          <Card.Body>
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <span className="font-mono text-xs tracking-widest uppercase text-fg-muted">
                  {t('stories.screen.recommendedForfait')}
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
                  {story.forfait.nom}
                </h2>
                <p className="mt-1 text-fg-muted">{story.forfait.subtitle}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-fg tabular-nums">
                  {story.forfait.prix}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => navigate('/simulateur')}
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                {t('stories.screen.ctaSimulate')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </section>

      {/* Other stories */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-widest uppercase text-fg-muted">
          {t('stories.screen.otherStories')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {otherPersonas.map((other) => {
            const o = PERSONA_STORIES[other]
            return (
              <Link
                key={other}
                to={`/histoires/${other}`}
                className="group"
              >
                <Card hover spotlight className={cn('ring-1 ring-inset', o.ringClass)}>
                  <Card.Body>
                    <div className="flex items-center gap-4">
                      <div className={cn('shrink-0 h-16 w-16 rounded-full overflow-hidden ring-2 ring-inset', o.ringClass)}>
                        <img
                          src={o.photo}
                          alt={t(`stories.personas.${o.slug}.name`)}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">
                          {t(`stories.personas.${o.slug}.episode`)}
                        </span>
                        <span className="text-base font-semibold tracking-tight text-fg">
                          {t(`stories.personas.${o.slug}.name`)}
                        </span>
                        <span className="text-sm text-fg-muted">
                          {t(`stories.personas.${o.slug}.tagline`)}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
