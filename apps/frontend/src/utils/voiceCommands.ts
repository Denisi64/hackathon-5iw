/**
 * Interprétation des commandes vocales — logique pure, testable sans navigateur.
 */
export type VoiceMatch =
  | { kind: 'glossary'; term: string }
  | { kind: 'navigate'; intent: string }
  | { kind: 'unknown' }

/** Minuscule + suppression des accents pour une comparaison tolérante. */
export function normalizeSpeech(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

export interface GlossaryTrigger {
  term: string
  label: string
}
export interface CommandTrigger {
  intent: string
  synonyms: string[]
}

/**
 * Associe une transcription à une définition de glossaire (prioritaire — ce sont
 * des questions) ou à une intention de navigation. `unknown` sinon.
 */
export function matchVoiceCommand(
  transcript: string,
  glossary: GlossaryTrigger[],
  commands: CommandTrigger[],
): VoiceMatch {
  const text = normalizeSpeech(transcript)
  if (!text) return { kind: 'unknown' }

  for (const g of glossary) {
    const label = normalizeSpeech(g.label)
    if (label && text.includes(label)) return { kind: 'glossary', term: g.term }
  }

  for (const c of commands) {
    if (
      c.synonyms.some((s) => {
        const n = normalizeSpeech(s)
        return n.length > 0 && text.includes(n)
      })
    ) {
      return { kind: 'navigate', intent: c.intent }
    }
  }

  return { kind: 'unknown' }
}
