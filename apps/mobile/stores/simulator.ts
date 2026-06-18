import { create } from 'zustand'

interface SimulatorHandoff {
  offerId: string | null
  profile: string | null
}

interface SimulatorStore extends SimulatorHandoff {
  setHandoff: (offerId: string, profile: string) => void
  clearHandoff: () => void
}

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  offerId: null,
  profile: null,
  setHandoff: (offerId, profile) => set({ offerId, profile }),
  clearHandoff: () => set({ offerId: null, profile: null }),
}))
