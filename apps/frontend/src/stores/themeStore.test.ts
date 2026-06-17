import { describe, expect, it, beforeEach } from 'vitest'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.setState({ theme: 'system' })
  })

  it('defaults to system', () => {
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('cycles light -> dark -> system -> light', () => {
    const { cycle } = useThemeStore.getState()
    useThemeStore.setState({ theme: 'light' })
    cycle()
    expect(useThemeStore.getState().theme).toBe('dark')
    cycle()
    expect(useThemeStore.getState().theme).toBe('system')
    cycle()
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('setTheme persists to localStorage', () => {
    useThemeStore.getState().setTheme('dark')
    expect(localStorage.getItem('clay-theme')).toBe('dark')
  })
})
