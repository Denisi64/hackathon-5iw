/**
 * Identifiants des termes du glossaire métier.
 * Les libellés et définitions vivent dans l'i18n sous la clé `glossary.<id>`,
 * traduits dans les 6 langues — voir locales/<lng>/common.json.
 */
export const GLOSSARY_TERMS = [
  'porteur',
  'payeur',
  'forfait',
  'tst',
  'amethyste',
  'cgvu',
  'zones',
  'boursier',
  'mdph',
  'franceConnect',
] as const

export type GlossaryTermId = (typeof GLOSSARY_TERMS)[number]

export function isGlossaryTerm(id: string): id is GlossaryTermId {
  return (GLOSSARY_TERMS as readonly string[]).includes(id)
}
