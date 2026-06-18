import bcrypt from 'bcryptjs'
import { db } from './index'
import { consents, documents, feedItems, holders, lineAlerts, notifications, offers, subscriptions, trips, users } from './schema'

const now = new Date()
const d = (offset: number) => new Date(now.getTime() + offset * 24 * 60 * 60 * 1000)

const LOW_FRAUD: object[] = [
  { name: 'ai_document_inconsistency', weight: 3, triggered: false },
  { name: 'document_expired',          weight: 3, triggered: false },
  { name: 'fast_form_fill',            weight: 2, triggered: false },
  { name: 'profile_mismatch',          weight: 2, triggered: false },
  { name: 'low_ocr_confidence',        weight: 3, triggered: false },
  { name: 'public_api_rights_unverified', weight: 3, triggered: false },
]

const MEDIUM_FRAUD: object[] = [
  { name: 'ai_document_inconsistency', weight: 3, triggered: false },
  { name: 'document_expired',          weight: 3, triggered: false },
  { name: 'fast_form_fill',            weight: 2, triggered: false },
  { name: 'profile_mismatch',          weight: 2, triggered: true },
  { name: 'low_ocr_confidence',        weight: 3, triggered: true },
  { name: 'public_api_rights_unverified', weight: 3, triggered: false },
]

const HIGH_FRAUD: object[] = [
  { name: 'ai_document_inconsistency', weight: 3, triggered: true, detail: 'Nom incohérent avec le dossier' },
  { name: 'document_expired',          weight: 3, triggered: true, detail: 'Document expiré le 2025-01-15' },
  { name: 'fast_form_fill',            weight: 2, triggered: false },
  { name: 'profile_mismatch',          weight: 2, triggered: true, detail: 'Profil TST non vérifié CAF' },
  { name: 'low_ocr_confidence',        weight: 3, triggered: true, detail: 'Confidence: 22' },
  { name: 'public_api_rights_unverified', weight: 3, triggered: false },
]

const TODAY = new Date().toISOString().split('T')[0]

async function seed() {
  console.log('🗑  Nettoyage des tables...')
  await db.delete(trips)
  await db.delete(lineAlerts)
  await db.delete(notifications)
  await db.delete(consents)
  await db.delete(documents)
  await db.delete(holders)
  await db.delete(subscriptions)
  await db.delete(users)
  await db.delete(feedItems)
  await db.delete(offers)

  // ── OFFRES ─────────────────────────────────────────────────────────────────
  console.log('📦 Insertion des offres...')
  await db.insert(offers).values([
    { id: 'navigo_annuel',      name: 'Navigo Annuel',          description: 'Abonnement annuel tout réseau — 12e mois offert',    yearlyPrice: 99880,  monthlyPrice: 9080,  renewal: 'annual'    },
    { id: 'navigo_senior',      name: 'Navigo Annuel Senior',   description: 'Tarif préférentiel 62 ans et plus (−50%)',           yearlyPrice: 54480,  monthlyPrice: 4540,  renewal: 'annual'    },
    { id: 'navigo_mois',        name: 'Navigo Mois',            description: 'Abonnement mensuel sans engagement',                 yearlyPrice: null,   monthlyPrice: 9080,  renewal: 'monthly'   },
    { id: 'navigo_semaine',     name: 'Navigo Semaine',         description: 'Forfait hebdomadaire du lundi au dimanche',          yearlyPrice: 168480, monthlyPrice: 12960, renewal: 'weekly'    },
    { id: 'imagine_r_junior',   name: 'Imagine R Junior',       description: 'Enfants de moins de 11 ans',                        yearlyPrice: 2520,   monthlyPrice: 210,   renewal: 'annual'    },
    { id: 'imagine_r_scolaire', name: 'Imagine R Scolaire',     description: 'Élèves de 11 à 25 ans (lycéens, collégiens)',        yearlyPrice: 40130,  monthlyPrice: 3344,  renewal: 'annual'    },
    { id: 'imagine_r_etudiant', name: 'Imagine R Étudiant',     description: 'Étudiants de 18 à 28 ans (boursiers inclus)',        yearlyPrice: 40130,  monthlyPrice: 3344,  renewal: 'annual'    },
    { id: 'liberte_plus',       name: 'Navigo Liberté+',        description: "Paiement à l'usage (~1,64 €/trajet)",                yearlyPrice: null,   monthlyPrice: null,  renewal: 'usage'     },
    { id: 'tst_50',             name: 'TST Réduction 50%',      description: 'Solidarité transport 50% — bénéficiaires AME',       yearlyPrice: 54480,  monthlyPrice: 4540,  renewal: 'quarterly' },
    { id: 'tst_75',             name: 'TST Solidarité 75%',     description: 'Solidarité transport 75% — CMU-C/CSS/ASS',          yearlyPrice: 27240,  monthlyPrice: 2270,  renewal: 'quarterly' },
    { id: 'tst_gratuite',       name: 'TST Gratuité',           description: 'Transport gratuit — RSA sous conditions, ASS+CSS',   yearlyPrice: 0,      monthlyPrice: 0,     renewal: 'quarterly' },
    { id: 'amethyste',          name: 'Améthyste',              description: 'Personnes reconnues handicapées (MDPH)',             yearlyPrice: null,   monthlyPrice: null,  renewal: 'annual'    },
  ])

  // ── UTILISATEURS ───────────────────────────────────────────────────────────
  console.log('👥 Insertion des utilisateurs...')
  const hash = await bcrypt.hash('password123', 10)

  const created = await db.insert(users).values([
    // Profil employee — Navigo Annuel actif
    { email: 'jean.dupont@test.com',      passwordHash: hash, firstName: 'Jean',    lastName: 'Dupont',    dateOfBirth: new Date('1985-03-12'), profile: 'employee',     gdprConsent: true, gdprConsentAt: d(-730) },
    // Profil student — Imagine R Étudiant actif + fraude medium
    { email: 'marie.martin@test.com',     passwordHash: hash, firstName: 'Marie',   lastName: 'Martin',    dateOfBirth: new Date('2002-07-18'), profile: 'student',      gdprConsent: true, gdprConsentAt: d(-365) },
    // Profil junior_school — enfant avec compte, abonnement actif
    { email: 'lucas.bernard@test.com',    passwordHash: hash, firstName: 'Lucas',   lastName: 'Bernard',   dateOfBirth: new Date('2016-09-01'), profile: 'junior_school', gdprConsent: true, gdprConsentAt: d(-180) },
    // Profil school — lycéenne, en attente de documents
    { email: 'emma.petit@test.com',       passwordHash: hash, firstName: 'Emma',    lastName: 'Petit',     dateOfBirth: new Date('2008-11-05'), profile: 'school',       gdprConsent: true, gdprConsentAt: d(-30)  },
    // Profil senior — Navigo Senior actif + sub suspendue ancienne
    { email: 'robert.moreau@test.com',    passwordHash: hash, firstName: 'Robert',  lastName: 'Moreau',    dateOfBirth: new Date('1959-02-20'), profile: 'senior',       gdprConsent: true, gdprConsentAt: d(-730) },
    // Profil tst — TST Gratuité actif (QF ≤ 400), fraude low
    { email: 'fatima.benali@test.com',    passwordHash: hash, firstName: 'Fatima',  lastName: 'Benali',    dateOfBirth: new Date('1988-06-30'), profile: 'tst',          gdprConsent: true, gdprConsentAt: d(-180) },
    // Profil amethyste — en attente de paiement
    { email: 'pierre.legrand@test.com',   passwordHash: hash, firstName: 'Pierre',  lastName: 'Legrand',   dateOfBirth: new Date('1975-04-15'), profile: 'amethyste',    gdprConsent: true, gdprConsentAt: d(-30)  },
    // Profil employee — parent achetant pour son enfant sans compte (payeur ≠ porteur)
    { email: 'sophie.dubois@test.com',    passwordHash: hash, firstName: 'Sophie',  lastName: 'Dubois',    dateOfBirth: new Date('1982-09-08'), profile: 'employee',     gdprConsent: true, gdprConsentAt: d(-730) },
    // Profil tst — TST 50% avec fraude high (QF entre 600-800, documents invalides)
    { email: 'karim.mansouri@test.com',   passwordHash: hash, firstName: 'Karim',   lastName: 'Mansouri',  dateOfBirth: new Date('1990-12-03'), profile: 'tst',          gdprConsent: true, gdprConsentAt: d(-180) },
    // Profil employee — draft uniquement (parcours abandonné)
    { email: 'alice.renard@test.com',     passwordHash: hash, firstName: 'Alice',   lastName: 'Renard',    dateOfBirth: new Date('1995-05-14'), profile: 'employee',     gdprConsent: true, gdprConsentAt: d(-7)   },
  ]).returning()

  const [jean, marie, lucas, emma, robert, fatima, pierre, sophie, karim, alice] = created

  // ── ABONNEMENTS ────────────────────────────────────────────────────────────
  console.log('📋 Insertion des abonnements...')

  // Jean — Navigo Annuel — ACTIVE (salarié standard, payeur = porteur)
  const [jeanSub] = await db.insert(subscriptions).values({
    payerId: jean.id, holderId: jean.id, offerId: 'navigo_annuel',
    status: 'active',
    startDate: new Date('2025-09-01'), endDate: new Date('2026-08-31'),
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
    stripeSubscriptionId: 'sub_test_jean_navigo', stripeCustomerId: 'cus_test_jean',
  }).returning()

  // Jean — Navigo Mois — EXPIRED (ancienne sub avant l'annuel)
  await db.insert(subscriptions).values({
    payerId: jean.id, holderId: jean.id, offerId: 'navigo_mois',
    status: 'expired',
    startDate: new Date('2024-09-01'), endDate: new Date('2025-08-31'),
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
    stripeSubscriptionId: 'sub_test_jean_mois_old', stripeCustomerId: 'cus_test_jean',
  })

  // Marie — Imagine R Étudiant — ACTIVE (étudiante, score fraude medium)
  const [marieSub] = await db.insert(subscriptions).values({
    payerId: marie.id, holderId: marie.id, offerId: 'imagine_r_etudiant',
    status: 'active',
    startDate: new Date('2025-09-01'), endDate: new Date('2026-08-31'),
    fraudScore: 31, fraudLevel: 'medium', fraudSignals: MEDIUM_FRAUD,
    stripeSubscriptionId: 'sub_test_marie_imr', stripeCustomerId: 'cus_test_marie',
  }).returning()

  // Marie — Imagine R Étudiant — CANCELLED (sub de l'année précédente)
  await db.insert(subscriptions).values({
    payerId: marie.id, holderId: marie.id, offerId: 'imagine_r_etudiant',
    status: 'cancelled',
    startDate: new Date('2024-09-01'), endDate: new Date('2025-08-31'),
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
  })

  // Lucas — Imagine R Junior — ACTIVE (enfant avec son propre compte)
  await db.insert(subscriptions).values({
    payerId: lucas.id, holderId: lucas.id, offerId: 'imagine_r_junior',
    status: 'active',
    startDate: new Date('2025-09-01'), endDate: new Date('2026-08-31'),
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
    stripeSubscriptionId: 'sub_test_lucas_jr', stripeCustomerId: 'cus_test_lucas',
  })

  // Emma — Imagine R Scolaire — PENDING_DOCUMENTS (lycéenne, attend certif)
  const [emmaSub] = await db.insert(subscriptions).values({
    payerId: emma.id, holderId: emma.id, offerId: 'imagine_r_scolaire',
    status: 'pending_documents',
  }).returning()

  // Robert — Navigo Senior — ACTIVE
  await db.insert(subscriptions).values({
    payerId: robert.id, holderId: robert.id, offerId: 'navigo_senior',
    status: 'active',
    startDate: new Date('2025-09-01'), endDate: new Date('2026-08-31'),
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
    stripeSubscriptionId: 'sub_test_robert_senior', stripeCustomerId: 'cus_test_robert',
  })

  // Robert — Navigo Annuel — SUSPENDED (impayé, ancienne sub)
  await db.insert(subscriptions).values({
    payerId: robert.id, holderId: robert.id, offerId: 'navigo_annuel',
    status: 'suspended',
    startDate: new Date('2024-01-01'),
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
    stripeSubscriptionId: 'sub_test_robert_suspended', stripeCustomerId: 'cus_test_robert',
  })

  // Fatima — TST Gratuité — ACTIVE (QF ≤ 400, fraude low)
  const [fatimaSub] = await db.insert(subscriptions).values({
    payerId: fatima.id, holderId: fatima.id, offerId: 'tst_gratuite',
    status: 'active',
    startDate: new Date('2026-04-01'), endDate: new Date('2026-06-30'),
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
    stripeCustomerId: 'cus_test_fatima',
  }).returning()

  // Pierre — Améthyste — PENDING_PAYMENT (docs valides, attend paiement)
  const [pierreSub] = await db.insert(subscriptions).values({
    payerId: pierre.id, holderId: pierre.id, offerId: 'amethyste',
    status: 'pending_payment',
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
  }).returning()

  // Sophie — Imagine R Junior — ACTIVE pour enfant SANS compte (payeur ≠ porteur)
  const [sophieSub] = await db.insert(subscriptions).values({
    payerId: sophie.id,
    offerId: 'imagine_r_junior',
    holderLastName: 'Dubois', holderFirstName: 'Thomas',
    holderDateOfBirth: new Date('2017-03-22'),
    status: 'active',
    startDate: new Date('2025-09-01'), endDate: new Date('2026-08-31'),
    fraudScore: 0, fraudLevel: 'low', fraudSignals: LOW_FRAUD,
    stripeSubscriptionId: 'sub_test_sophie_jr', stripeCustomerId: 'cus_test_sophie',
  }).returning()

  // Karim — TST 50% — ACTIVE avec fraude HIGH (documents falsifiés)
  const [karimSub] = await db.insert(subscriptions).values({
    payerId: karim.id, holderId: karim.id, offerId: 'tst_50',
    status: 'active',
    startDate: new Date('2026-04-01'), endDate: new Date('2026-06-30'),
    fraudScore: 69, fraudLevel: 'high', fraudSignals: HIGH_FRAUD,
    stripeCustomerId: 'cus_test_karim',
  }).returning()

  // Alice — Navigo Semaine — DRAFT (parcours de souscription abandonné)
  await db.insert(subscriptions).values({
    payerId: alice.id, offerId: 'navigo_semaine',
    status: 'draft',
  })

  // Alice — Navigo Annuel — DRAFT (second essai en cours)
  await db.insert(subscriptions).values({
    payerId: alice.id, offerId: 'navigo_annuel',
    status: 'draft',
  })

  // ── DOCUMENTS ──────────────────────────────────────────────────────────────
  console.log('📄 Insertion des documents...')

  const aiDoc = (fields: Record<string, unknown>) => JSON.stringify(fields)

  // Jean — CNI valide (confiance 97%)
  await db.insert(documents).values({
    subscriptionId: jeanSub.id, type: 'cni',
    minioKey: `${jeanSub.id}/cni-jean.jpg`,
    status: 'valid', aiConfidence: 97,
    aiExtractedData: aiDoc({ documentType: 'cni', lastName: 'Dupont', firstName: 'Jean', birthDate: '1985-03-12', expiryDate: '2032-04-15', valid: true, readable: true, confidence: 97, issues: [] }),
    validatedAt: d(-365), expiresAt: new Date('2032-04-15'),
  })

  // Marie — CNI valide + certificat de scolarité valide (2 docs)
  await db.insert(documents).values([
    {
      subscriptionId: marieSub.id, type: 'cni',
      minioKey: `${marieSub.id}/cni-marie.jpg`,
      status: 'valid', aiConfidence: 95,
      aiExtractedData: aiDoc({ documentType: 'cni', lastName: 'Martin', firstName: 'Marie', birthDate: '2002-07-18', expiryDate: '2030-11-20', valid: true, readable: true, confidence: 95, issues: [] }),
      validatedAt: d(-365), expiresAt: new Date('2030-11-20'),
    },
    {
      subscriptionId: marieSub.id, type: 'certificat_scolarite',
      minioKey: `${marieSub.id}/cert-marie.jpg`,
      status: 'valid', aiConfidence: 72,
      aiExtractedData: aiDoc({ documentType: 'certificat_scolarite', lastName: 'Martin', firstName: 'Marie', birthDate: '2002-07-18', schoolYear: '2025-2026', institution: 'Université Paris Cité', valid: true, readable: true, confidence: 72, issues: [] }),
      validatedAt: d(-365), expiresAt: new Date('2026-09-30'),
    },
  ])

  // Emma — certificat scolaire UPLOADED (pas encore analysé par l'IA)
  await db.insert(documents).values({
    subscriptionId: emmaSub.id, type: 'certificat_scolarite',
    minioKey: `${emmaSub.id}/cert-emma.jpg`,
    status: 'uploaded',
  })

  // Fatima — attestation CAF valide
  await db.insert(documents).values({
    subscriptionId: fatimaSub.id, type: 'attestation_caf',
    minioKey: `${fatimaSub.id}/caf-fatima.jpg`,
    status: 'valid', aiConfidence: 88,
    aiExtractedData: aiDoc({ documentType: 'attestation_caf', lastName: 'Benali', firstName: 'Fatima', valid: true, readable: true, confidence: 88, issues: [] }),
    validatedAt: d(-180),
  })

  // Pierre — carte invalidité valide
  await db.insert(documents).values({
    subscriptionId: pierreSub.id, type: 'carte_invalidite',
    minioKey: `${pierreSub.id}/carte-pierre.jpg`,
    status: 'valid', aiConfidence: 91,
    aiExtractedData: aiDoc({ documentType: 'carte_invalidite', lastName: 'Legrand', firstName: 'Pierre', valid: true, readable: true, confidence: 91, issues: [] }),
    validatedAt: d(-30),
  })

  // Sophie — livret de famille valide (pour son enfant Thomas)
  await db.insert(documents).values({
    subscriptionId: sophieSub.id, type: 'livret_famille',
    minioKey: `${sophieSub.id}/livret-sophie.jpg`,
    status: 'valid', aiConfidence: 93,
    aiExtractedData: aiDoc({ documentType: 'livret_famille', lastName: 'Dubois', firstName: 'Thomas', birthDate: '2017-03-22', valid: true, readable: true, confidence: 93, issues: [] }),
    validatedAt: d(-180),
  })

  // Karim — attestation CAF REJETÉE (fraude : flou, nom incohérent, expiré)
  await db.insert(documents).values({
    subscriptionId: karimSub.id, type: 'attestation_caf',
    minioKey: `${karimSub.id}/caf-karim.jpg`,
    status: 'rejected', aiConfidence: 22,
    aiExtractedData: aiDoc({ documentType: 'attestation_caf', lastName: 'Ben Mansour', firstName: 'K.', valid: false, readable: false, confidence: 22, expiryDate: '2025-01-15', issues: ['Document flou', 'Nom incohérent avec le dossier', 'Document expiré'] }),
    expiresAt: new Date('2025-01-15'),
  })

  // ── HOLDERS ────────────────────────────────────────────────────────────────
  console.log('👶 Insertion des porteurs...')

  // Thomas Dubois : enfant sans compte, rattaché à Sophie (payeur)
  await db.insert(holders).values({
    payerId: sophie.id, userId: null,
    lastName: 'Dubois', firstName: 'Thomas',
    dateOfBirth: '2017-03-22',
    canSelfManage: false,
  })

  // Lucas Bernard : enfant avec compte propre, rattaché à ses parents (simulé via son propre compte)
  await db.insert(holders).values({
    payerId: lucas.id, userId: lucas.id,
    lastName: 'Bernard', firstName: 'Lucas',
    dateOfBirth: '2016-09-01',
    canSelfManage: false,
  })

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
  console.log('🔔 Insertion des notifications...')
  await db.insert(notifications).values([
    { userId: jean.id,    type: 'subscription_renewal',   message: 'Votre abonnement Navigo Annuel sera renouvelé dans 30 jours. Vérifiez vos informations de paiement.' },
    { userId: marie.id,   type: 'subscription_active',    message: 'Votre abonnement Imagine R Étudiant est actif. Bonne route !' },
    { userId: marie.id,   type: 'document_warning',       message: 'La lisibilité de votre document a déclenché un avertissement de vérification.' },
    { userId: emma.id,    type: 'documents_required',     message: 'Votre certificat de scolarité est en cours de vérification par notre équipe.' },
    { userId: robert.id,  type: 'subscription_suspended', message: 'Votre abonnement Navigo Annuel a été suspendu suite à un impayé. Veuillez régulariser votre situation.' },
    { userId: fatima.id,  type: 'subscription_renewal',   message: 'Votre droit TST Gratuité expire le 30 juin 2026. Renouvelez votre attestation CAF.' },
    { userId: pierre.id,  type: 'payment_required',       message: 'Vos documents ont été validés. Finalisez votre souscription Améthyste en renseignant votre moyen de paiement.' },
    { userId: karim.id,   type: 'fraud_alert',            message: 'Un problème a été détecté sur votre dossier. Veuillez contacter le support Comutitres au 3424 (lun–ven 8h–20h).' },
    { userId: alice.id,   type: 'subscription_draft',     message: 'Vous avez une souscription en cours. Reprenez votre parcours pour finaliser votre abonnement.' },
  ])

  // ── CONSENTEMENTS ──────────────────────────────────────────────────────────
  console.log('✅ Insertion des consentements...')
  await db.insert(consents).values(
    created.flatMap((u) => [
      { userId: u.id, type: 'rgpd'             as const, accepted: true, acceptedAt: now },
      { userId: u.id, type: 'cookies'          as const, accepted: true, acceptedAt: now },
      { userId: u.id, type: 'document_upload'  as const, accepted: true, acceptedAt: now },
    ])
  )

  // ── FEED ITEMS ─────────────────────────────────────────────────────────────
  console.log('📰 Insertion des feed items...')
  await db.insert(feedItems).values([
    { id: 'student-bourse-2026',    type: 'news',  title: 'Imagine R boursier 2026-2027',          body: 'Les dossiers de renouvellement pour la rentrée 2026 sont ouverts. Souscrivez avant le 31 août pour bénéficier du tarif réduit dès septembre.', emoji: '🎓', tag: 'Étudiant',       relevantInterests: ['student'],            relevantProfiles: ['student'] },
    { id: 'rers-perturbations',     type: 'alert', title: 'RER A : travaux du 20 au 25 juin',       body: 'Circulation perturbée entre Nation et Vincennes. Des bus de remplacement sont mis en place. Prévoyez 15 min supplémentaires.',               emoji: '🚧', tag: 'Trafic',         relevantInterests: ['commute'],            relevantProfiles: ['employee', 'student', 'school'] },
    { id: 'employer-refund-tip',    type: 'tip',   title: 'Votre employeur rembourse 50%',          body: 'Pensez à transmettre votre attestation Navigo à votre service RH avant le 10 du mois pour être remboursé sur votre prochaine paie.',          emoji: '💡', tag: 'Conseil',        relevantInterests: ['worker'],             relevantProfiles: ['employee'] },
    { id: 'senior-transition',      type: 'tip',   title: 'Passez au tarif Senior',                 body: "À partir de 62 ans, vous pouvez bénéficier du Navigo Senior à 45,40 €/mois. Économisez jusqu'à 270 €/an par rapport au tarif standard.",     emoji: '🌿', tag: 'Senior',         relevantInterests: ['senior'],             relevantProfiles: ['senior'] },
    { id: 'nuit-des-musees',        type: 'promo', title: 'Nuit des musées — entrée gratuite',       body: 'Ce samedi, accédez à plus de 100 musées parisiens gratuitement. Votre pass Navigo vous y emmène sans supplément.',                           emoji: '🎭', tag: 'Culture',        relevantInterests: ['culture'],            relevantProfiles: ['employee', 'student', 'senior'] },
    { id: 'velo-ile-de-france',     type: 'promo', title: 'Vélib\' + Navigo : l\'été combiné',       body: 'Abonnez-vous à Vélib\' Métropole avec 30% de réduction si vous êtes titulaire d\'un pass Navigo actif.',                                     emoji: '🚴', tag: 'Sport',          relevantInterests: ['sport', 'eco'],       relevantProfiles: ['employee', 'student'] },
    { id: 'tst-renouvellement',     type: 'alert', title: 'Vos droits TST expirent bientôt',        body: 'Pensez à renouveler votre attestation CAF avant la fin du trimestre pour continuer à bénéficier de la Tarification Solidarité Transport.',   emoji: '📋', tag: 'TST',            relevantInterests: ['solidarity'],         relevantProfiles: ['tst'] },
    { id: 'imagine-r-junior-2026',  type: 'news',  title: 'Imagine R Junior — rentrée 2026',        body: 'Les inscriptions pour l\'Imagine R Junior (moins de 11 ans) sont ouvertes. Votre enfant voyagera toute l\'année scolaire pour 24,80 €.',      emoji: '👧', tag: 'Famille',        relevantInterests: ['family'],             relevantProfiles: ['employee', 'senior'] },
    { id: 'co2-stats',              type: 'tip',   title: 'Votre impact CO₂ ce mois-ci',            body: 'En prenant les transports en commun ce mois-ci, vous avez économisé l\'équivalent de 42 kg de CO₂ vs la voiture. Bravo !',                  emoji: '♻️', tag: 'Mobilité verte', relevantInterests: ['eco'],                relevantProfiles: ['employee', 'student'] },
    { id: 'stade-france-match',     type: 'promo', title: 'Match au Stade de France ce weekend',    body: 'Le RER B vous emmène directement au Stade de France en 20 min depuis Châtelet. Votre Navigo est valable sur tout le réseau.',                emoji: '⚽', tag: 'Sport',          relevantInterests: ['sport'],              relevantProfiles: ['employee', 'student', 'senior'] },
  ])

  // ── ALERTES LIGNES ─────────────────────────────────────────────────────────
  console.log('🚨 Insertion des alertes lignes...')
  await db.insert(lineAlerts).values([
    { line: 'A',   lineType: 'rer',   type: 'travaux',       title: 'RER A : travaux du 20 au 25 juin',         message: 'Circulation perturbée entre Nation et Vincennes. Des bus de substitution sont mis en place. Prévoyez 15 min supplémentaires.',         startDate: '2026-06-20', endDate: '2026-06-25' },
    { line: 'RER A', lineType: 'rer', type: 'travaux',       title: 'RER A : travaux du 20 au 25 juin',         message: 'Circulation perturbée entre Nation et Vincennes. Des bus de substitution sont mis en place. Prévoyez 15 min supplémentaires.',         startDate: '2026-06-20', endDate: '2026-06-25' },
    { line: 'B',   lineType: 'rer',   type: 'perturbation',  title: 'RER B : interruption partielle le weekend', message: 'Pas de service entre l\'Aéroport CDG et Mitry-Claye les samedis et dimanches jusqu\'au 30 juin. Bus de remplacement disponibles.',  startDate: '2026-06-14', endDate: '2026-06-30' },
    { line: 'M13', lineType: 'metro', type: 'info',          title: 'M13 : fréquence renforcée',                 message: 'Passage toutes les 3 minutes aux heures de pointe (7h–9h30 et 17h–20h) jusqu\'au 30 juin.',                                          startDate: '2026-06-01', endDate: '2026-06-30' },
    { line: '13',  lineType: 'metro', type: 'info',          title: 'M13 : fréquence renforcée',                 message: 'Passage toutes les 3 minutes aux heures de pointe (7h–9h30 et 17h–20h) jusqu\'au 30 juin.',                                          startDate: '2026-06-01', endDate: '2026-06-30' },
    { line: 'C',   lineType: 'rer',   type: 'info',          title: 'RER C : nouveau service été',               message: 'Augmentation de la fréquence vers Versailles les vendredis et samedis soirs à partir du 21 juin.',                                    startDate: '2026-06-21', endDate: '2026-08-31' },
  ])

  // ── TRAJETS ────────────────────────────────────────────────────────────────
  console.log('🚇 Insertion des trajets...')
  await db.insert(trips).values([
    // Jean — Navigo Annuel — trajets domicile/travail M13
    { userId: jean.id, line: 'M13', lineType: 'metro', from: 'Châtillon – Montrouge', to: 'Saint-Lazare',        departureTime: '08:12', arrivalTime: '08:41', duration: 29, zones: [1, 2], co2Saved: 32, tripDate: TODAY },
    { userId: jean.id, line: 'M13', lineType: 'metro', from: 'Saint-Lazare',          to: 'Châtillon – Montrouge', departureTime: '18:35', arrivalTime: '19:04', duration: 29, zones: [1, 2], co2Saved: 32, tripDate: TODAY },
    // Marie — Imagine R Étudiant — RER B université
    { userId: marie.id, line: 'B',  lineType: 'rer',   from: 'Denfert-Rochereau',     to: 'Orsay – Ville',       departureTime: '08:45', arrivalTime: '09:22', duration: 37, zones: [1, 4], co2Saved: 48, tripDate: TODAY },
    { userId: marie.id, line: 'B',  lineType: 'rer',   from: 'Orsay – Ville',         to: 'Denfert-Rochereau',   departureTime: '17:10', arrivalTime: '17:47', duration: 37, zones: [4, 1], co2Saved: 48, tripDate: TODAY },
    // Robert — Navigo Senior — trajet loisir
    { userId: robert.id, line: 'M4', lineType: 'metro', from: 'Montrouge',            to: 'Châtelet – Les Halles', departureTime: '10:05', arrivalTime: '10:28', duration: 23, zones: [1, 2], co2Saved: 28, tripDate: TODAY },
    // Fatima — TST — bus quotidien
    { userId: fatima.id, line: '323', lineType: 'bus', from: 'Villejuif Louis Aragon', to: 'Kremlin-Bicêtre',     departureTime: '07:55', arrivalTime: '08:12', duration: 17, zones: [2, 3], co2Saved: 15, tripDate: TODAY },
    { userId: fatima.id, line: '323', lineType: 'bus', from: 'Kremlin-Bicêtre',       to: 'Villejuif Louis Aragon', departureTime: '17:30', arrivalTime: '17:47', duration: 17, zones: [3, 2], co2Saved: 15, tripDate: TODAY },
  ])
}

seed()
  .then(() => { console.log('\n✅ Seed terminé avec succès'); process.exit(0) })
  .catch((err: unknown) => { console.error('\n❌ Seed échoué:', err); process.exit(1) })
