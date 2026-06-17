import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useVoiceMode } from '../../hooks/useVoiceMode'
import { GLOSSARY_TERMS } from '../../utils/glossaire'
import { matchVoiceCommand, type CommandTrigger, type GlossaryTrigger } from '../../utils/voiceCommands'

const INTENT_ROUTES: Record<string, string> = {
  simulateur: '/simulateur',
  souscrire: '/souscrire',
  parcours: '/parcours',
  monEspace: '/mon-espace',
  accueil: '/',
}

export function VoiceAssistant() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState('')

  // Déclaré avant useVoiceMode : interprète la transcription et agit.
  const handleResult = useCallback(
    (transcript: string) => {
      const glossary: GlossaryTrigger[] = GLOSSARY_TERMS.map((term) => ({ term, label: t(`glossary.${term}.term`) }))
      const commands: CommandTrigger[] = Object.keys(INTENT_ROUTES).map((intent) => ({
        intent,
        synonyms: t(`voice.commands.${intent}`).split('|'),
      }))

      const match = matchVoiceCommand(transcript, glossary, commands)
      if (match.kind === 'glossary') {
        const message = t(`glossary.${match.term}.definition`)
        setFeedback(message)
        speak(message)
      } else if (match.kind === 'navigate') {
        const message = t(`voice.acting.${match.intent}`)
        setFeedback(message)
        speak(message)
        navigate(INTENT_ROUTES[match.intent])
      } else {
        const message = t('voice.notUnderstood')
        setFeedback(message)
        speak(message)
      }
    },
    [t, navigate],
  )

  const { isSupported, listening, transcript, start, stop, speak } = useVoiceMode(handleResult)

  // Bascule silencieuse : aucun rendu si le navigateur ne supporte pas la voix.
  if (!isSupported) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2">
      {(listening || feedback) && (
        <div className="max-w-xs rounded-2xl border border-border-default bg-bg-elevated/95 backdrop-blur-xl shadow-card p-3">
          <p className="font-mono text-[10px] tracking-widest uppercase text-fg-muted">
            {listening ? t('voice.listening') : t('voice.label')}
          </p>
          <p className="mt-1 text-sm text-fg">{transcript || feedback || t('voice.hint')}</p>
        </div>
      )}
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        aria-label={listening ? t('voice.stop') : t('voice.start')}
        className={cn(
          'grid h-12 w-12 place-items-center rounded-full shadow-card-hover transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
          listening
            ? 'bg-rose-500 text-white animate-pulse'
            : 'bg-accent text-white hover:-translate-y-0.5',
        )}
      >
        {listening ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  )
}
