import { useMemo, useState } from 'react'
import type { Plan, SimulatorParams } from '../types/domain'
import { sortByPrice, getSavingsVsTickets, getAnnualPrice } from '../utils/fareEngine'

const DEFAULT_PARAMS: SimulatorParams = {
  profile: 'employee',
  daysPerWeek: 5,
  tripsPerDay: 2,
  zones: 5,
}

export interface SimulatorResult {
  plan: Plan
  yearlyPrice: number
  savings: number
}

export function useSimulator(initial: Partial<SimulatorParams> = {}) {
  const [params, setParams] = useState<SimulatorParams>({ ...DEFAULT_PARAMS, ...initial })

  const update = <K extends keyof SimulatorParams>(key: K, value: SimulatorParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const results: SimulatorResult[] = useMemo(
    () => sortByPrice(params).map((f) => ({
      plan: f,
      yearlyPrice: getAnnualPrice(f, params),
      savings: getSavingsVsTickets(f, params),
    })),
    [params],
  )

  return { params, update, results }
}
