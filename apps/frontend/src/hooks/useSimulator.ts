import { useMemo, useState } from 'react'
import type { SimulatorParams, UserProfile, ZoneLevel } from '../types/domain'
import { rankOffers } from '../utils/priceEngine'

const DEFAULT_PARAMS: SimulatorParams = {
  profile: 'employee',
  weeklyUsageDays: 5,
  tripsPerDay: 2,
  zones: 5,
  age: 32,
}

export function useSimulator(initialParams: SimulatorParams = DEFAULT_PARAMS) {
  const [params, setParams] = useState<SimulatorParams>(initialParams)
  const results = useMemo(() => rankOffers(params), [params])

  return {
    params,
    results,
    setProfile: (profile: UserProfile) =>
      setParams((current) => ({
        ...current,
        profile,
        age: getDefaultAge(profile),
      })),
    setWeeklyUsageDays: (weeklyUsageDays: number) =>
      setParams((current) => ({ ...current, weeklyUsageDays })),
    setTripsPerDay: (tripsPerDay: number) => setParams((current) => ({ ...current, tripsPerDay })),
    setZones: (zones: ZoneLevel) => setParams((current) => ({ ...current, zones })),
  }
}

function getDefaultAge(profile: UserProfile): number {
  if (profile === 'junior_school') return 8
  if (profile === 'school') return 15
  if (profile === 'student') return 21
  if (profile === 'senior') return 66
  return 32
}
