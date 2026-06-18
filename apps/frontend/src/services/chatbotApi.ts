import { clearApiTokens, readApiAccessToken, saveApiTokens } from '../stores/authStore'
import { getRefreshToken } from './api'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessagePayload {
  role: ChatRole
  content: string
}

type AuthTokens = {
  access_token: string
  refresh_token?: string
}

export type ChatbotApiErrorCode =
  | 'not_authenticated'
  | 'backend_auth_failed'
  | 'network'
  | 'unauthorized'
  | 'stream'

export class ChatbotApiError extends Error {
  constructor(public readonly code: ChatbotApiErrorCode) {
    super(code)
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw response
  return response.json() as Promise<T>
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new ChatbotApiError('not_authenticated')

  try {
    const tokens = await postJson<AuthTokens>('/api/auth/refresh', { refresh_token: refreshToken })
    saveApiTokens({ access_token: tokens.access_token, refresh_token: tokens.refresh_token ?? refreshToken })
    return tokens.access_token
  } catch {
    clearApiTokens()
    throw new ChatbotApiError('unauthorized')
  }
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh) {
    const token = readApiAccessToken()
    if (token) return token
  }
  return refreshAccessToken()
}

function parseServerSentEvent(event: string, onDelta: (text: string) => void): boolean {
  const dataLines = event
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))

  for (const line of dataLines) {
    const data = line.slice('data:'.length).trim()
    if (!data) continue
    if (data === '[DONE]') return true

    try {
      const parsed = JSON.parse(data) as { text?: unknown }
      if (typeof parsed.text === 'string') onDelta(parsed.text)
    } catch {
      onDelta(data)
    }
  }

  return false
}

async function openChatStream(
  token: string,
  messages: ChatMessagePayload[],
  signal: AbortSignal,
): Promise<Response> {
  return fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  })
}

export async function streamChatResponse({
  messages,
  signal,
  onDelta,
}: {
  messages: ChatMessagePayload[]
  /** Accepté pour compatibilité d'appel ; non utilisé (auth par refresh token). */
  locale?: string
  signal: AbortSignal
  onDelta: (text: string) => void
}): Promise<void> {
  let token = await getAccessToken()
  let response = await openChatStream(token, messages, signal)

  if (response.status === 401) {
    token = await getAccessToken(true)
    response = await openChatStream(token, messages, signal)
  }

  if (response.status === 401 || response.status === 403) throw new ChatbotApiError('unauthorized')
  if (!response.ok || !response.body) throw new ChatbotApiError('stream')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const event of events) {
        if (parseServerSentEvent(event, onDelta)) return
      }
    }

    if (buffer && !parseServerSentEvent(buffer, onDelta)) {
      onDelta(buffer)
    }
  } catch (error) {
    if (signal.aborted) return
    throw error instanceof ChatbotApiError ? error : new ChatbotApiError('network')
  } finally {
    reader.releaseLock()
  }
}
