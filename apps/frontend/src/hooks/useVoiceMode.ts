import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LOCALE_META } from '../lib/i18n'
import { useLocale } from './useLocale'

// Types minimaux de la Web Speech API (absente de lib.dom selon les versions).
interface SpeechRecognitionEventLike {
  results: { [i: number]: { [j: number]: { transcript: string } } }
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start(): void
  stop(): void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export interface UseVoiceMode {
  isSupported: boolean
  listening: boolean
  transcript: string
  start: () => void
  stop: () => void
  speak: (text: string) => void
}

/**
 * Reconnaissance vocale + synthèse, adaptées à la langue de l'app.
 * `isSupported` permet une bascule silencieuse sur l'UI classique.
 */
export function useVoiceMode(onResult?: (transcript: string) => void): UseVoiceMode {
  const { locale } = useLocale()
  const lang = LOCALE_META[locale]?.intl ?? 'fr-FR'

  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  const isSupported = useMemo(
    () => Boolean(getRecognitionCtor()) && typeof window !== 'undefined' && 'speechSynthesis' in window,
    [],
  )

  const getRecognition = useCallback(() => {
    if (recRef.current) return recRef.current
    const Ctor = getRecognitionCtor()
    if (!Ctor) return null
    const rec = new Ctor()
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e) => {
      const tr = e.results[0]?.[0]?.transcript ?? ''
      setTranscript(tr)
      onResultRef.current?.(tr)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    return rec
  }, [])

  const start = useCallback(() => {
    const rec = getRecognition()
    if (!rec) return
    rec.lang = lang
    setTranscript('')
    try {
      rec.start()
      setListening(true)
    } catch {
      // start() lève si déjà en écoute — on ignore.
    }
  }, [getRecognition, lang])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.95 // légèrement ralenti pour l'accessibilité
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    },
    [lang],
  )

  // Coupe l'écoute et la synthèse au démontage.
  useEffect(() => {
    return () => {
      recRef.current?.stop()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  return { isSupported, listening, transcript, start, stop, speak }
}
