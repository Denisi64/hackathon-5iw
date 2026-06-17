import { useMemo, useState } from 'react'
import type { Forfait, SimulateurParams } from '../types/domain'
import { classerParPrix, getEconomieVsTickets, getPrixAnnuel } from '../utils/tarifEngine'

const DEFAULT_PARAMS: SimulateurParams = {
  profil: 'salarie',
  joursParSemaine: 5,
  trajetsParJour: 2,
  zones: 5,
}

export interface SimulatorResult {
  forfait: Forfait
  prixAn: number
  economie: number
}

export function useSimulator(initial: Partial<SimulateurParams> = {}) {
  const [params, setParams] = useState<SimulateurParams>({ ...DEFAULT_PARAMS, ...initial })

  const update = <K extends keyof SimulateurParams>(key: K, value: SimulateurParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const results: SimulatorResult[] = useMemo(
    () => classerParPrix(params).map((f) => ({
      forfait: f,
      prixAn: getPrixAnnuel(f, params),
      economie: getEconomieVsTickets(f, params),
    })),
    [params],
  )

  return { params, update, results }
}
