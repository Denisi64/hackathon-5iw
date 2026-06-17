import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Bot, LogIn, MessageCircle, RefreshCcw, Send, Sparkles, Ticket, User, X } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useLocale } from '../hooks/useLocale'
import { cn } from '../lib/cn'
import { streamChatResponse, type ChatMessagePayload, ChatbotApiError } from '../services/chatbotApi'
import { useAuthStore } from '../stores/authStore'
import { PLANS } from '../utils/faresData'
import { getPlanName } from '../utils/planDisplay'

type ChatMessage = ChatMessagePayload & {
  id: string
}

const SUGGESTION_KEYS = [
  'chatbot.suggestions.student',
  'chatbot.suggestions.worker',
  'chatbot.suggestions.solidarity',
  'chatbot.suggestions.documents',
]

function createMessage(role: ChatMessagePayload['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  }
}

function toPayload(messages: ChatMessage[]): ChatMessagePayload[] {
  return messages
    .filter((message) => message.content.trim().length > 0)
    .map(({ role, content }) => ({ role, content }))
}

export default function ChatbotScreen() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createMessage('assistant', t('chatbot.welcomeMessage')),
  ])
  const [input, setInput] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant' && message.content.trim()),
    [messages],
  )

  const recommendedPlan = useMemo(() => {
    const content = latestAssistantMessage?.content.toLowerCase() ?? ''
    if (!content) return null

    return PLANS.find((plan) => {
      const translatedName = getPlanName(plan, t).toLowerCase()
      const fallbackName = plan.name.toLowerCase()
      return content.includes(plan.id.toLowerCase()) || content.includes(translatedName) || content.includes(fallbackName)
    }) ?? null
  }, [latestAssistantMessage, t])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isStreaming) return

    const userMessage = createMessage('user', trimmed)
    const assistantMessage = createMessage('assistant', '')
    const nextMessages = [...messages, userMessage, assistantMessage]

    setMessages(nextMessages)
    setInput('')
    setErrorKey(null)
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    let receivedText = ''

    try {
      await streamChatResponse({
        locale,
        signal: controller.signal,
        messages: toPayload([...messages, userMessage]),
        onDelta: (text) => {
          receivedText += text
          setMessages((current) => current.map((message) => (
            message.id === assistantMessage.id ? { ...message, content: message.content + text } : message
          )))
        },
      })

      if (!receivedText.trim()) {
        setMessages((current) => current.map((message) => (
          message.id === assistantMessage.id ? { ...message, content: t('chatbot.emptyResponse') } : message
        )))
      }
    } catch (error) {
      if (controller.signal.aborted) return

      const key = error instanceof ChatbotApiError
        ? `chatbot.errors.${error.code}`
        : 'chatbot.errors.network'

      setErrorKey(key)
      setMessages((current) => current.filter((message) => message.id !== assistantMessage.id))
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setIsStreaming(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(input)
  }

  const resetConversation = () => {
    abortRef.current?.abort()
    setMessages([createMessage('assistant', t('chatbot.welcomeMessage'))])
    setInput('')
    setErrorKey(null)
    setIsStreaming(false)
  }

  const stopStreaming = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }

  return (
    <div className="grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="flex min-h-[calc(100vh-180px)] flex-col">
        <div className="mb-5 flex flex-col gap-3">
          <Badge variant="info" icon={<Sparkles className="h-3 w-3" aria-hidden="true" />}>
            {t('chatbot.kicker')}
          </Badge>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                {t('chatbot.title')}
              </h1>
              <p className="mt-2 max-w-2xl text-fg-muted">{t('chatbot.subtitle')}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCcw className="h-4 w-4" aria-hidden="true" />}
              onClick={resetConversation}
            >
              {t('chatbot.actions.reset')}
            </Button>
          </div>
        </div>

        <Card className="min-h-[560px] flex-1 p-0">
          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label={t('chatbot.messagesAria')}
            className="flex-1 overflow-y-auto p-4 sm:p-6"
          >
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                const isUser = message.role === 'user'
                return (
                  <div
                    key={message.id}
                    className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
                  >
                    <span
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                        isUser ? 'bg-accent text-white' : 'bg-accent/12 text-accent',
                      )}
                      aria-hidden="true"
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </span>
                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
                        isUser
                          ? 'rounded-tr-md bg-accent text-white'
                          : 'rounded-tl-md border border-border-default bg-surface text-fg',
                      )}
                    >
                      {message.content ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-fg-muted">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:120ms]" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:240ms]" />
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-border-default p-4 sm:p-5">
            {errorKey && (
              <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                {t(errorKey)}
              </div>
            )}

            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => void sendMessage(t(key))}
                  className="rounded-full border border-border-default bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-border-hover hover:bg-surface-hover hover:text-fg disabled:opacity-50"
                >
                  {t(key)}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="chatbot-message" className="sr-only">{t('chatbot.inputLabel')}</label>
              <textarea
                id="chatbot-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                rows={2}
                placeholder={t('chatbot.placeholder')}
                className="min-h-12 flex-1 resize-none rounded-xl border border-border-default bg-bg-elevated px-4 py-3 text-sm text-fg outline-none transition-[border-color,box-shadow,background-color] placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent/40"
              />
              {isStreaming ? (
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<X className="h-4 w-4" aria-hidden="true" />}
                  onClick={stopStreaming}
                  className="sm:self-end"
                >
                  {t('chatbot.actions.stop')}
                </Button>
              ) : (
                <Button
                  type="submit"
                  leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
                  disabled={!input.trim()}
                  className="sm:self-end"
                >
                  {t('chatbot.actions.send')}
                </Button>
              )}
            </form>
          </div>
        </Card>
      </section>

      <aside className="flex flex-col gap-4 lg:pt-[126px]">
        <Card variant="glass" className="p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-fg">{t('chatbot.side.profileTitle')}</h2>
              <p className="mt-1 text-sm text-fg-muted">
                {user ? t('chatbot.side.signedIn', { firstName: user.firstName }) : t('chatbot.side.signedOut')}
              </p>
            </div>
          </div>
          {!user && (
            <Button
              className="mt-4"
              fullWidth
              variant="secondary"
              leftIcon={<LogIn className="h-4 w-4" aria-hidden="true" />}
              onClick={() => navigate('/login')}
            >
              {t('header.nav.login')}
            </Button>
          )}
        </Card>

        {recommendedPlan && (
          <Card className="p-5">
            <Badge variant="success" icon={<Ticket className="h-3 w-3" aria-hidden="true" />}>
              {t('chatbot.side.detected')}
            </Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-fg">
              {getPlanName(recommendedPlan, t)}
            </h2>
            <p className="mt-2 text-sm text-fg-muted">{t('chatbot.side.detectedHint')}</p>
            <div className="mt-4 grid gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(`/forfaits/${recommendedPlan.id}`)}
              >
                {t('chatbot.actions.viewPlan')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => navigate(`/souscrire?plan=${recommendedPlan.id}`)}
              >
                {t('chatbot.actions.subscribe')}
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-5">
          <h2 className="font-semibold text-fg">{t('chatbot.side.scopeTitle')}</h2>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li>{t('chatbot.side.scope1')}</li>
            <li>{t('chatbot.side.scope2')}</li>
            <li>{t('chatbot.side.scope3')}</li>
          </ul>
        </Card>
      </aside>
    </div>
  )
}
