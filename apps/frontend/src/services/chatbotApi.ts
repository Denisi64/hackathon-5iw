import {
  clearApiTokens,
  getCurrentStoredUser,
  readApiAccessToken,
  saveApiTokens,
} from '../stores/authStore'

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

async function authenticateWithBackend(locale: string): Promise<string> {
  const user = getCurrentStoredUser()
  if (!user) throw new ChatbotApiError('not_authenticated')

  try {
    const tokens = await postJson<AuthTokens>('/api/auth/login', {
      email: user.email,
      password: user.password,
    })
    saveApiTokens(tokens)
    return tokens.access_token
  } catch (error) {
    if (!(error instanceof Response) || error.status !== 401) {
      throw new ChatbotApiError('network')
    }
  }

  try {
    const tokens = await postJson<AuthTokens>('/api/auth/register', {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      language: locale,
    })
    saveApiTokens(tokens)
    return tokens.access_token
  } catch {
    throw new ChatbotApiError('backend_auth_failed')
  }
}

async function getAccessToken(locale: string, forceRefresh = false): Promise<string> {
  if (!forceRefresh) {
    const token = readApiAccessToken()
    if (token) return token
  }

  clearApiTokens()
  return authenticateWithBackend(locale)
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
  locale,
  signal,
  onDelta,
}: {
  messages: ChatMessagePayload[]
  locale: string
  signal: AbortSignal
  onDelta: (text: string) => void
}): Promise<void> {
  let token = await getAccessToken(locale)
  let response = await openChatStream(token, messages, signal)

  if (response.status === 401) {
    token = await getAccessToken(locale, true)
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
