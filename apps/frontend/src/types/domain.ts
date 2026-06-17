export type ProfilUsager =
  | 'salarie'
  | 'etudiant'
  | 'scolaire_junior'
  | 'scolaire'
  | 'senior'
  | 'tst'
  | 'amethyste'

export type NiveauZone = 1 | 2 | 3 | 4 | 5

export type ForfaitType = 'jour' | 'hebdo' | 'mensuel' | 'annuel' | 'usage'

export interface ProfilFlags {
  /** Sous statut "étudiant" en école d'enseignement supérieur. */
  isEtudiant?: boolean
  /** Apprenti ou alternant (couvert par Imagine R Scolaire). */
  isAlternant?: boolean
  /** Salarié — déclenche le remboursement employeur 50%. */
  isSalarie?: boolean
  /** Retraité, indépendant de l'âge. */
  isRetraite?: boolean
  /** Bénéficiaire RSA (sous conditions). */
  hasRSA?: boolean
  /** Bénéficiaire CSS sans participation financière. */
  hasCSSSansParticipation?: boolean
  /** Bénéficiaire ASS (Allocation Solidarité Spécifique). */
  hasASS?: boolean
  /** Bénéficiaire AME (Aide Médicale d'État). */
  hasAME?: boolean
}

export interface SimulateurParams {
  profil: ProfilUsager
  joursParSemaine: number
  trajetsParJour: number
  zones: NiveauZone
  age?: number
  boursier?: boolean
  flags?: ProfilFlags
}

export interface Forfait {
  id: string
  nom: string
  /** Type d'engagement / périodicité de facturation. */
  type: ForfaitType
  /** Phrase d'accroche courte affichée sur la card forfait. */
  description: string
  /** Image officielle IDFM si dispo, sinon null (fallback gradient). */
  image: string | null
  /** Priorité de tri (1 = mis en avant en premier, plus grand = moins prioritaire). */
  priorite: number
  /** URL source officielle. */
  sourceUrl: string
  profils: ProfilUsager[]
  prixAn: number | null
  prixMois: number | null
  zones: { min: NiveauZone; max: NiveauZone }
  renouvellement: 'annuel' | 'mensuel' | 'trimestriel' | 'hebdomadaire' | 'usage' | 'jour'
  justificatifsRequis: string[]
  /** Filtre de base utilisé par le simulateur historique (jours/semaine, âge). */
  condition?: (p: SimulateurParams) => boolean
  /** Prédicat d'éligibilité riche (utilise flags + age + profil). */
  eligible?: (p: SimulateurParams) => boolean
  remboursementEmployeur?: number
}
