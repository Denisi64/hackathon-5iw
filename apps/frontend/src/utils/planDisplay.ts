import type { Plan } from '../types/domain'
import { LIBERTE_PLUS_PRICE_PER_TRIP } from './faresData'
import { formatCurrency } from '../lib/formatters'
import type { Locale } from '../lib/i18n'

type Translate = (key: string, options?: Record<string, unknown>) => string

export const DOCUMENT_LABEL_KEYS: Record<string, string> = {
  identity_document: 'plans.display.documents.identity_document',
  school_certificate: 'plans.display.documents.school_certificate',
  scholarship_certificate: 'plans.display.documents.scholarship_certificate',
  family_record_book: 'plans.display.documents.family_record_book',
  caf_certificate: 'plans.display.documents.caf_certificate',
  tax_notice: 'plans.display.documents.tax_notice',
  disability_card: 'plans.display.documents.disability_card',
  mdph_notice: 'plans.display.documents.mdph_notice',
}

export const PROFILE_LABEL_KEYS: Record<string, string> = {
  employee: 'plans.display.profiles.employee',
  student: 'plans.display.profiles.student',
  junior_school: 'plans.display.profiles.junior_school',
  school: 'plans.display.profiles.school',
  senior: 'plans.display.profiles.senior',
  solidarity: 'plans.display.profiles.solidarity',
  amethyst: 'plans.display.profiles.amethyst',
}

/** Libellé d'un prix à l'unité, selon la cadence du titre (semaine / jour / unité). */
function getUnitPriceLabel(plan: Plan, locale: Locale | string, t: Translate): string {
  const price = formatCurrency(plan.unitPrice as number, locale)
  if (plan.renewal === 'weekly') return t('plans.display.pricePerWeek', { price })
  if (plan.renewal === 'day') return t('plans.display.pricePerDay', { price })
  return t('plans.display.pricePerUnit', { price })
}

export function getPlanPriceLabel(plan: Plan, locale: Locale | string, t: Translate): string {
  if (plan.priceLabel) return plan.priceLabel
  if (plan.priceVariable) return t('plans.priceVariable')
  if (plan.unitPrice != null) return getUnitPriceLabel(plan, locale, t)
  if (plan.yearlyPrice === 0) return t('plans.free')
  if (plan.id === 'liberty_plus') {
    return t('plans.pricePerTrip', { price: formatCurrency(LIBERTE_PLUS_PRICE_PER_TRIP, locale) })
  }
  if (plan.monthlyPrice !== null) {
    return t('plans.display.pricePerMonth', { price: formatCurrency(plan.monthlyPrice, locale) })
  }
  if (plan.yearlyPrice !== null) {
    return t('plans.display.pricePerYear', { price: formatCurrency(plan.yearlyPrice, locale) })
  }
  return t('plans.display.priceOnFile')
}

export function getPlanYearlyLabel(plan: Plan, locale: Locale | string, t: Translate): string {
  if (plan.priceLabel || plan.priceVariable || plan.unitPrice != null) return t('plans.display.allZones')
  if (plan.yearlyPrice === 0) return t('plans.free')
  if (plan.yearlyPrice !== null) {
    return t('plans.display.pricePerYear', { price: formatCurrency(plan.yearlyPrice, locale) })
  }
  if (plan.id === 'liberty_plus') return t('plans.display.payAsYouGo')
  return t('plans.priceVariable')
}

export function getPlanBenefits(plan: Plan, t: Translate): string[] {
  const benefits = [
    t('plans.display.benefits.zones', { min: plan.zones.min, max: plan.zones.max }),
    getRenewalLabel(plan.renewal, t),
  ]

  if (plan.employerRefund) {
    benefits.push(t('plans.display.benefits.employerRefund', { percent: Math.round(plan.employerRefund * 100) }))
  }
  if (plan.requiredDocuments.length === 0) benefits.push(t('plans.display.benefits.noDocuments'))
  else benefits.push(t('plans.display.benefits.documentCheck'))
  if (plan.id.includes('solidarity') || plan.id.includes('discount') || plan.id.includes('free')) {
    benefits.push(t('plans.display.benefits.solidarityCheck'))
  }
  if (plan.id.startsWith('imagine_r')) benefits.push(t('plans.display.benefits.schoolRhythm'))
  if (plan.id === 'liberty_plus') benefits.push(t('plans.display.benefits.payOnlyWhenTraveling'))

  return benefits
}

export function getRenewalLabel(renewal: Plan['renewal'], t: Translate): string {
  const keys: Record<Plan['renewal'], string> = {
    yearly: 'plans.display.renewal.yearly',
    monthly: 'plans.display.renewal.monthly',
    quarterly: 'plans.display.renewal.quarterly',
    weekly: 'plans.display.renewal.weekly',
    usage: 'plans.display.renewal.usage',
    day: 'plans.display.renewal.day',
  }
  return t(keys[renewal])
}

export function getDocumentLabels(plan: Plan, t: Translate): string[] {
  return plan.requiredDocuments.map((document) => t(DOCUMENT_LABEL_KEYS[document] ?? document))
}

export function getProfileLabel(profile: string, t: Translate): string {
  return t(PROFILE_LABEL_KEYS[profile] ?? profile)
}

export function getPlanName(plan: Plan, t: Translate): string {
  return t(`plans.catalog.${plan.id}.name`, { defaultValue: plan.name })
}

export function getPlanDescription(plan: Plan, t: Translate): string {
  return t(`plans.catalog.${plan.id}.description`, { defaultValue: plan.description })
}
