import { getToken } from './api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface RecommendPayload {
  profile: string
  age?: number
  income?: number
  isStudent?: boolean
}

export interface RecommendResult {
  offerId: string
  offerName: string
  reason: string
  monthlyPrice: number
}

export const aiService = {
  chatStream: (
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: Error) => void,
  ): (() => void) => {
    const token = getToken()
    const ctrl = new AbortController()

    fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') { onDone(); return }
            try {
              const { text } = JSON.parse(payload) as { text: string }
              onChunk(text)
            } catch {}
          }
        }
        onDone()
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') onError(err)
      })

    return () => ctrl.abort()
  },

  recommend: (payload: RecommendPayload) =>
    fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.json() as Promise<RecommendResult>),
}
