import { create } from 'zustand'

interface OnboardingState {
  firstName: string
  lastName: string
  email: string
  password: string
  city: string
  birthDate: string
  profile: string
  interests: string[]
  setField: <K extends keyof Omit<OnboardingState, 'setField' | 'reset'>>(key: K, value: OnboardingState[K]) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  city: '',
  birthDate: '',
  profile: '',
  interests: [],
  setField: (key, value) => set((s) => ({ ...s, [key]: value })),
  reset: () => set({ firstName: '', lastName: '', email: '', password: '', city: '', birthDate: '', profile: '', interests: [] }),
}))
