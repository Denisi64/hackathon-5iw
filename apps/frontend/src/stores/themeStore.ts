import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'clay-theme'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  cycle: () => void
}

const cycleOrder: Theme[] = ['light', 'dark', 'system']

function readInitial(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {}
  return 'system'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readInitial(),
  setTheme: (theme) => {
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
    set({ theme })
  },
  cycle: () => {
    const current = get().theme
    const next = cycleOrder[(cycleOrder.indexOf(current) + 1) % cycleOrder.length]
    get().setTheme(next)
  },
}))
