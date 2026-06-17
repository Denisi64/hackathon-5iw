import type { Forfait } from '../types/domain'
import { PRIX_LIBERTE_PLUS_PAR_TRAJET } from './tarifsData'
import { formatCurrency } from '../lib/formatters'
import type { Locale } from '../lib/i18n'

type Translate = (key: string, options?: Record<string, unknown>) => string

export const DOCUMENT_LABEL_KEYS: Record<string, string> = {
  piece_identite: 'forfaits.display.documents.piece_identite',
  certificat_scolarite: 'forfaits.display.documents.certificat_scolarite',
  attestation_bourse: 'forfaits.display.documents.attestation_bourse',
  livret_famille: 'forfaits.display.documents.livret_famille',
  attestation_caf: 'forfaits.display.documents.attestation_caf',
  avis_imposition: 'forfaits.display.documents.avis_imposition',
  carte_invalidite: 'forfaits.display.documents.carte_invalidite',
  notification_mdph: 'forfaits.display.documents.notification_mdph',
}

export const PROFILE_LABEL_KEYS: Record<string, string> = {
  salarie: 'forfaits.display.profiles.salarie',
  etudiant: 'forfaits.display.profiles.etudiant',
  scolaire_junior: 'forfaits.display.profiles.scolaire_junior',
  scolaire: 'forfaits.display.profiles.scolaire',
  senior: 'forfaits.display.profiles.senior',
  tst: 'forfaits.display.profiles.tst',
  amethyste: 'forfaits.display.profiles.amethyste',
}

export function getForfaitPriceLabel(forfait: Forfait, locale: Locale | string, t: Translate): string {
  if (forfait.prixAn === 0) return t('forfaits.free')
  if (forfait.id === 'liberte_plus') {
    return t('forfaits.pricePerTrip', { price: formatCurrency(PRIX_LIBERTE_PLUS_PAR_TRAJET, locale) })
  }
  if (forfait.prixMois !== null) {
    return t('forfaits.display.pricePerMonth', { price: formatCurrency(forfait.prixMois, locale) })
  }
  if (forfait.prixAn !== null) {
    return t('forfaits.display.pricePerYear', { price: formatCurrency(forfait.prixAn, locale) })
  }
  return t('forfaits.display.priceOnFile')
}

export function getForfaitYearlyLabel(forfait: Forfait, locale: Locale | string, t: Translate): string {
  if (forfait.prixAn === 0) return t('forfaits.free')
  if (forfait.prixAn !== null) {
    return t('forfaits.display.pricePerYear', { price: formatCurrency(forfait.prixAn, locale) })
  }
  if (forfait.id === 'liberte_plus') return t('forfaits.display.payAsYouGo')
  return t('forfaits.priceVariable')
}

export function getForfaitBenefits(forfait: Forfait, t: Translate): string[] {
  const benefits = [
    t('forfaits.display.benefits.zones', { min: forfait.zones.min, max: forfait.zones.max }),
    getRenewalLabel(forfait.renouvellement, t),
  ]

  if (forfait.remboursementEmployeur) {
    benefits.push(t('forfaits.display.benefits.employerRefund', { percent: Math.round(forfait.remboursementEmployeur * 100) }))
  }
  if (forfait.justificatifsRequis.length === 0) benefits.push(t('forfaits.display.benefits.noDocuments'))
  else benefits.push(t('forfaits.display.benefits.documentCheck'))
  if (forfait.id.includes('solidarite') || forfait.id.includes('reduction') || forfait.id.includes('gratuite')) {
    benefits.push(t('forfaits.display.benefits.solidarityCheck'))
  }
  if (forfait.id.startsWith('imagine_r')) benefits.push(t('forfaits.display.benefits.schoolRhythm'))
  if (forfait.id === 'liberte_plus') benefits.push(t('forfaits.display.benefits.payOnlyWhenTraveling'))

  return benefits
}

export function getRenewalLabel(renewal: Forfait['renouvellement'], t: Translate): string {
  const keys: Record<Forfait['renouvellement'], string> = {
    annuel: 'forfaits.display.renewal.annuel',
    mensuel: 'forfaits.display.renewal.mensuel',
    trimestriel: 'forfaits.display.renewal.trimestriel',
    hebdomadaire: 'forfaits.display.renewal.hebdomadaire',
    usage: 'forfaits.display.renewal.usage',
    jour: 'forfaits.display.renewal.jour',
  }
  return t(keys[renewal])
}

export function getDocumentLabels(forfait: Forfait, t: Translate): string[] {
  return forfait.justificatifsRequis.map((document) => t(DOCUMENT_LABEL_KEYS[document] ?? document))
}

export function getProfileLabel(profile: string, t: Translate): string {
  return t(PROFILE_LABEL_KEYS[profile] ?? profile)
}

export function getForfaitName(forfait: Forfait, t: Translate): string {
  return t(`forfaits.catalog.${forfait.id}.name`, { defaultValue: forfait.nom })
}

export function getForfaitDescription(forfait: Forfait, t: Translate): string {
  return t(`forfaits.catalog.${forfait.id}.description`, { defaultValue: forfait.description })
}
