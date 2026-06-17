/**
 * Cycle de vie d'un dossier de souscription, du dépôt à l'envoi de la carte.
 * Le statut est dérivé du temps écoulé depuis la soumission — sans backend,
 * le dossier progresse de lui-même (utile pour la démo de soutenance).
 */
export const DOSSIER_STAGES = ['submitted', 'processing', 'validated', 'cardSent'] as const
export type DossierStage = (typeof DOSSIER_STAGES)[number]

/** Seuils de passage (secondes depuis la soumission). Calibrés pour la démo. */
export const STAGE_THRESHOLDS_S = [0, 20, 60, 150] as const

/**
 * Indice de l'étape courante (0–3) d'après l'horodatage de soumission.
 * Sans `submittedAt` (dossiers antérieurs au suivi de statut), on considère
 * le dossier comme validé.
 */
export function getDossierStageIndex(submittedAt: string | undefined, now: number = Date.now()): number {
  if (!submittedAt) return 2
  const submitted = new Date(submittedAt).getTime()
  if (Number.isNaN(submitted)) return 2
  const elapsedS = (now - submitted) / 1000
  let idx = 0
  for (let i = 0; i < STAGE_THRESHOLDS_S.length; i++) {
    if (elapsedS >= STAGE_THRESHOLDS_S[i]) idx = i
  }
  return idx
}

export function isDossierComplete(submittedAt: string | undefined, now: number = Date.now()): boolean {
  return getDossierStageIndex(submittedAt, now) >= DOSSIER_STAGES.length - 1
}
