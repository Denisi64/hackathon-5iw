import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { PERSONA_LIST, PERSONA_STORIES } from '../data/personaStories'
import { cn } from '../lib/cn'

// Signature color used by the gradient badge over each persona image.
const ICON_BADGE_GRADIENTS: Record<'purple' | 'amber' | 'green' | 'pink', string> = {
  purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
  amber: 'bg-gradient-to-br from-amber-300 to-amber-500',
  green: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
  pink: 'bg-gradient-to-br from-pink-400 to-pink-600',
}

export default function LandingScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-32">
      {/* HERO */}
      <section className="flex flex-col items-center gap-6 pt-12 pb-8 text-center">
        <Badge variant="info" icon={<Sparkles className="h-3 w-3" aria-hidden="true" />}>
          {t('hero.badge')}
        </Badge>

        <h1 className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] leading-[1.05]">
          <span className="bg-gradient-to-b from-fg via-fg to-fg/60 bg-clip-text text-transparent">
            {t('hero.title')}
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-fg-muted">
          {t('hero.subtitle')}
        </p>

        {/* Tagline narrative — shimmer accent, accordée au titre */}
        <p
          className="mt-1 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight
                     bg-[linear-gradient(110deg,var(--accent),var(--accent-bright),var(--accent))]
                     bg-[length:200%_100%] bg-clip-text text-transparent
                     animate-shimmer"
        >
          {t('narrative.tagline')}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => navigate('/simulateur')}
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          >
            {t('hero.ctaPrimary')}
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/forfaits')}>
            {t('hero.ctaSecondary')}
          </Button>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section>
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-fg-muted">02 — Plateforme</p>
            <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-fg">
              {t('features.simulator.title')}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:auto-rows-[180px]">
          <Card variant="feature" hover spotlight className="md:col-span-4 md:row-span-2 flex">
            <Card.Body>
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
                    {t('features.simulator.title')}
                  </h3>
                  <p className="mt-3 max-w-md text-fg-muted">{t('features.simulator.body')}</p>
                </div>
                <Link
                  to="/simulateur"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:gap-2.5 transition-[gap]"
                >
                  {t('hero.ctaPrimary')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </Card.Body>
          </Card>

          <Card hover spotlight className="md:col-span-2">
            <Card.Body>
              <h3 className="text-lg font-semibold tracking-tight text-fg">
                {t('features.tunnel.title')}
              </h3>
              <p className="mt-2 text-sm text-fg-muted">{t('features.tunnel.body')}</p>
            </Card.Body>
          </Card>

          <Card hover spotlight className="md:col-span-2">
            <Card.Body>
              <h3 className="text-lg font-semibold tracking-tight text-fg">
                {t('features.aiCheck.title')}
              </h3>
              <p className="mt-2 text-sm text-fg-muted">{t('features.aiCheck.body')}</p>
            </Card.Body>
          </Card>
        </div>
      </section>

      {/* STORIES — the brand narrative */}
      <section id="stories">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-fg-muted">
            03 — {t('stories.kicker')}
          </p>
          <h2 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-fg">
            {t('stories.title')}
          </h2>
          <p className="max-w-2xl text-base text-fg-muted">{t('stories.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERSONA_LIST.map((slug) => {
            const story = PERSONA_STORIES[slug]
            const Icon = story.icon
            return (
              <Link
                key={slug}
                to={`/histoires/${slug}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base rounded-2xl"
              >
                <Card
                  hover
                  spotlight
                  className="group transition-colors duration-300 h-full !p-0"
                >
                  {/* Edge-to-edge photo header. */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
                    <img
                      src={story.photo}
                      alt={t(`stories.personas.${slug}.name`)}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      draggable={false}
                    />
                    {/* Fade vers le bg-elevated pour fondre la photo dans la card. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-bg-elevated/30 to-transparent" />
                    {/* Tint subtil couleur signature. */}
                    <div className={cn('absolute inset-0 bg-gradient-to-tr opacity-30 mix-blend-overlay', story.fromClass, story.toClass)} />
                    {/* Episode badge top-left. */}
                    <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-bg-elevated/90 backdrop-blur-sm border border-border-default px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase text-fg-muted">
                      {t(`stories.personas.${slug}.episode`)}
                    </span>
                    {/* Icon badge bottom-right, couleur signature. */}
                    <span className={cn('absolute bottom-3 right-3 grid place-items-center h-9 w-9 rounded-full text-white shadow-card ring-2 ring-bg-elevated', ICON_BADGE_GRADIENTS[story.color])}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  {/* Body */}
                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-fg">
                        {t(`stories.personas.${slug}.name`)}
                      </h3>
                      <p className="text-sm text-fg-muted">{t(`stories.personas.${slug}.role`)}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-fg">
                      {t(`stories.personas.${slug}.tagline`)}
                    </p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden rounded-2xl border border-border-default bg-bg-elevated p-10 sm:p-14 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0
                     bg-[radial-gradient(ellipse_at_center,rgba(var(--spotlight-rgb),0.18),transparent_60%)]"
        />
        <div className="relative">
          <p className="font-mono text-xs tracking-widest uppercase text-fg-muted">04 — {t('hero.ctaPrimary')}</p>
          <h2 className="mt-3 max-w-2xl mx-auto text-3xl sm:text-4xl font-semibold tracking-tight text-fg">
            {t('hero.title')}
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-fg-muted">{t('hero.subtitle')}</p>
          <div className="mt-8 inline-flex">
            <Button
              size="lg"
              onClick={() => navigate('/simulateur')}
              rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              {t('hero.ctaPrimary')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
