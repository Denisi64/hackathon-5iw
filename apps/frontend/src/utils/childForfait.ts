/**
 * Détection du sous-produit Imagine R selon l'âge du porteur mineur, et calcul
 * d'âge. Fonctions pures, testables.
 */
export function getAgeFromBirthDate(birthDate: string, now: number = Date.now()): number | null {
  const d = new Date(birthDate)
  if (Number.isNaN(d.getTime())) return null
  const n = new Date(now)
  let age = n.getFullYear() - d.getFullYear()
  const monthDiff = n.getMonth() - d.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && n.getDate() < d.getDate())) age--
  return age
}

/** Imagine R Junior avant 11 ans, Imagine R Scolaire ensuite. */
export function detectChildForfaitId(
  birthDate: string,
  now: number = Date.now(),
): 'imagine_r_junior' | 'imagine_r_scolaire' | null {
  const age = getAgeFromBirthDate(birthDate, now)
  if (age === null) return null
  return age < 11 ? 'imagine_r_junior' : 'imagine_r_scolaire'
}

/** À 16 ans, le porteur peut reprendre la gestion de son abonnement. */
export const TRANSFER_AGE = 16
