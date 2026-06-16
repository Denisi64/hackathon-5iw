export type ProfilUsager =
  | 'salarie'
  | 'etudiant'
  | 'scolaire_junior'
  | 'scolaire'
  | 'senior'
  | 'tst'
  | 'amethyste'

export type NiveauZone = 1 | 2 | 3 | 4 | 5

export type Renouvellement = 'annuel' | 'mensuel' | 'trimestriel' | 'hebdomadaire' | 'usage'

export interface SimulateurParams {
  profil: ProfilUsager
  joursParSemaine: number
  trajetsParJour: number
  zones: NiveauZone
  age?: number
  boursier?: boolean
}

export interface Forfait {
  id: string
  nom: string
  description: string
  profils: ProfilUsager[]
  prixAn: number | null
  prixMois: number | null
  zones: { min: NiveauZone; max: NiveauZone }
  renouvellement: Renouvellement
  justificatifsRequis: string[]
  condition?: (params: SimulateurParams) => boolean
  remboursementEmployeur?: number
}

export interface TarifResultat {
  forfait: Forfait
  prixAnnuel: number
  economieVsTickets: number
  eligible: boolean
  recommended: boolean
  conseil: string
}

export interface SubscriptionDraft {
  profil: ProfilUsager
  forfaitId: string
  currentStep: number
  porteurDifferent: boolean
  verificationAutomatique: boolean
}
