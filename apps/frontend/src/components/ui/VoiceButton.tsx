import { Mic, Volume2 } from 'lucide-react'
import { Button } from './Button'

interface VoiceButtonProps {
  listening: boolean
  speaking?: boolean
  onPress: () => void
}

export function VoiceButton({ listening, speaking = false, onPress }: VoiceButtonProps) {
  const label = listening ? 'Desactiver la commande vocale' : 'Activer la commande vocale'
  return (
    <Button
      className={`voice-button ${listening ? 'voice-button--listening' : ''}`}
      onClick={onPress}
      type="button"
      variant="secondary"
      aria-label={label}
      title={label}
    >
      {speaking ? <Volume2 aria-hidden="true" /> : <Mic aria-hidden="true" />}
    </Button>
  )
}
