import { describe, expect, it } from 'vitest'
import { matchVoiceCommand, normalizeSpeech } from './voiceCommands'

const glossary = [
  { term: 'tst', label: 'TST' },
  { term: 'porteur', label: 'porteur' },
]
const commands = [
  { intent: 'simulateur', synonyms: ['simulateur', 'tarif'] },
  { intent: 'souscrire', synonyms: ['souscrire', 'abonnement'] },
]

describe('normalizeSpeech', () => {
  it('lowercases and strips accents', () => {
    expect(normalizeSpeech('Améthyste')).toBe('amethyste')
  })
})

describe('matchVoiceCommand', () => {
  it('matches a glossary question (accent-insensitive)', () => {
    expect(matchVoiceCommand("qu'est-ce que le TST ?", glossary, commands)).toEqual({ kind: 'glossary', term: 'tst' })
  })

  it('prioritises glossary over navigation', () => {
    const g = [{ term: 'forfait', label: 'forfait' }]
    const c = [{ intent: 'souscrire', synonyms: ['forfait'] }]
    expect(matchVoiceCommand('explique le forfait', g, c)).toEqual({ kind: 'glossary', term: 'forfait' })
  })

  it('matches a navigation intent', () => {
    expect(matchVoiceCommand('ouvre le simulateur', glossary, commands)).toEqual({ kind: 'navigate', intent: 'simulateur' })
  })

  it('returns unknown when nothing matches', () => {
    expect(matchVoiceCommand('bonjour ça va', glossary, commands)).toEqual({ kind: 'unknown' })
  })

  it('returns unknown for an empty transcript', () => {
    expect(matchVoiceCommand('   ', glossary, commands)).toEqual({ kind: 'unknown' })
  })
})
