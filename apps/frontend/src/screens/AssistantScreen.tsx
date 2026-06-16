import { Bot, Send, UserRound } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content:
      "Bonjour, je suis la pour trouver l'abonnement le plus adapte. Quelle est votre situation aujourd'hui ?",
  },
]

export function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [value, setValue] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = value.trim()
    if (!content) return

    setMessages((current) => [
      ...current,
      { role: 'user', content },
      {
        role: 'assistant',
        content: getMockAnswer(content),
      },
    ])
    setValue('')
  }

  return (
    <main className="screen">
      <section className="chat-panel" aria-labelledby="assistant-title">
        <span className="eyebrow">
          <Bot aria-hidden="true" />
          Assistant
        </span>
        <h1 id="assistant-title">Orientation simple et multilingue.</h1>
        <div className="chat-log" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`chat-message chat-message--${message.role}`} key={`${message.role}-${index}`}>
              {message.role === 'assistant' ? <Bot aria-hidden="true" /> : <UserRound aria-hidden="true" />}
              <p>{message.content}</p>
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="assistant-message">
            Message
          </label>
          <input
            id="assistant-message"
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ex: Je suis etudiant et je prends le train tous les jours"
            value={value}
          />
          <Button aria-label="Envoyer" type="submit">
            <Send aria-hidden="true" />
          </Button>
        </form>
      </section>
    </main>
  )
}

function getMockAnswer(content: string): string {
  const normalized = content.toLowerCase()
  if (normalized.includes('etudiant') || normalized.includes('student')) {
    return "Imagine R Etudiant semble adapte. Je peux verifier votre statut automatiquement, sans document a uploader. Vous pouvez aussi demarrer la souscription."
  }
  if (normalized.includes('caf') || normalized.includes('revenu') || normalized.includes('aide')) {
    return "Vous pourriez beneficier de la TST, une aide transport selon vos revenus. La verification CAF peut etre simulee maintenant."
  }
  if (normalized.includes('senior') || normalized.includes('62')) {
    return "Navigo Senior est probablement le plus interessant si vous avez 62 ans ou plus."
  }
  return "Merci. Combien de jours par semaine utilisez-vous les transports ? Un conseiller Comutitres reste disponible au 3424 si vous preferez."
}

export function AssistantCta() {
  return (
    <Link className="button button--primary button--md" to="/souscrire?forfait=imagine_r_etudiant">
      Souscrire
    </Link>
  )
}
