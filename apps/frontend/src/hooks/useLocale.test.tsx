import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import i18n from '../lib/i18n'
import { useLocale } from './useLocale'

describe('useLocale', () => {
  beforeEach(async () => {
    localStorage.clear()
    document.documentElement.lang = 'fr'
    document.head.querySelector('#font-noto-jp')?.remove()
    await i18n.changeLanguage('fr')
  })

  it('returns the current locale', () => {
    const { result } = renderHook(() => useLocale())
    expect(result.current.locale).toBe('fr')
  })

  it('setLocale syncs html.lang and persists', async () => {
    const { result } = renderHook(() => useLocale())
    await act(async () => { await result.current.setLocale('en') })
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('clay-lang')).toBe('en')
  })

  it('lazy-loads Noto Sans JP only when switching to ja', async () => {
    const { result } = renderHook(() => useLocale())
    expect(document.getElementById('font-noto-jp')).toBeNull()
    await act(async () => { await result.current.setLocale('ja') })
    expect(document.getElementById('font-noto-jp')).not.toBeNull()
  })
})
