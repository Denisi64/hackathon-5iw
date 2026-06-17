import { describe, expect, it } from 'vitest'
import fr from './fr/common.json'
import en from './en/common.json'
import es from './es/common.json'
import itLocale from './it/common.json'
import ja from './ja/common.json'
import pt from './pt/common.json'

function flatten(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return []
  const keys: string[] = []
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object') keys.push(...flatten(v, path))
    else keys.push(path)
  }
  return keys.sort()
}

const referenceKeys = flatten(fr)

describe('locales parity', () => {
  it.each([
    ['en', en], ['es', es], ['it', itLocale], ['ja', ja], ['pt', pt],
  ])('%s has the same leaf keys as fr', (_label, locale) => {
    expect(flatten(locale)).toEqual(referenceKeys)
  })
})
