import { describe, expect, it } from 'vitest'
import { toggleInterest, INTERESTS } from './interests'

describe('toggleInterest', () => {
  it('ajoute un id absent', () => {
    expect(toggleInterest(['a'], 'b')).toEqual(['a', 'b'])
  })
  it('retire un id présent', () => {
    expect(toggleInterest(['a', 'b'], 'a')).toEqual(['b'])
  })
})

describe('INTERESTS', () => {
  it('contient les 12 catégories canoniques', () => {
    expect(INTERESTS.map((i) => i.id)).toEqual(
      ['mobility','culture','sport','education','work','food','wellbeing','music','eco','travel','family','shopping'],
    )
  })
})
