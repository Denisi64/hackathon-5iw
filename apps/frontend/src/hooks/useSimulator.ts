import { useMemo, useState } from 'react'
import type { NiveauZone, ProfilUsager, SimulateurParams } from '../types/domain'
import { classerForfaits } from '../utils/tarifEngine'

const DEFAULT_PARAMS: SimulateurParams = {
  profil: 'salarie',
  joursParSemaine: 5,
  trajetsParJour: 2,
  zones: 5,
  age: 32,
}

export function useSimulator(initialParams: SimulateurParams = DEFAULT_PARAMS) {
  const [params, setParams] = useState<SimulateurParams>(initialParams)
  const resultats = useMemo(() => classerForfaits(params), [params])

  return {
    params,
    resultats,
    setProfil: (profil: ProfilUsager) =>
      setParams((current) => ({
        ...current,
        profil,
        age: getDefaultAge(profil),
      })),
    setJoursParSemaine: (joursParSemaine: number) =>
      setParams((current) => ({ ...current, joursParSemaine })),
    setTrajetsParJour: (trajetsParJour: number) =>
      setParams((current) => ({ ...current, trajetsParJour })),
    setZones: (zones: NiveauZone) => setParams((current) => ({ ...current, zones })),
  }
}

function getDefaultAge(profil: ProfilUsager): number {
  if (profil === 'scolaire_junior') return 8
  if (profil === 'scolaire') return 15
  if (profil === 'etudiant') return 21
  if (profil === 'senior') return 66
  return 32
}
