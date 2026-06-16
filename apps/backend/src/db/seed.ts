import bcrypt from 'bcryptjs'
import { db } from './index'
import { offers, users } from './schema'

async function seed() {
  await db
    .insert(offers)
    .values([
      {
        id: 'navigo_annuel',
        name: 'Navigo Annuel',
        description: 'Abonnement annuel tout-reseau',
        yearlyPrice: 90240,
        monthlyPrice: 7520,
        renewal: 'annual',
        profiles: ['employee', 'student', 'senior'],
        requiredDocuments: [],
        meta: { zones: { min: 1, max: 5 }, employerReimbursement: 0.5 },
      },
      {
        id: 'navigo_senior',
        name: 'Navigo Annuel Senior',
        description: 'Tarif preferentiel 62 ans et plus',
        yearlyPrice: 63360,
        monthlyPrice: 5280,
        renewal: 'annual',
        profiles: ['senior'],
        requiredDocuments: ['id_document'],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'navigo_mois',
        name: 'Navigo Mois',
        description: 'Sans engagement mensuel',
        yearlyPrice: 103680,
        monthlyPrice: 8640,
        renewal: 'monthly',
        profiles: ['employee', 'student', 'senior'],
        requiredDocuments: [],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'navigo_semaine',
        name: 'Navigo Semaine',
        description: 'Usage ponctuel par semaine',
        yearlyPrice: 159900,
        monthlyPrice: 12300,
        renewal: 'weekly',
        profiles: ['employee', 'student', 'senior'],
        requiredDocuments: [],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'imagine_r_junior',
        name: 'Imagine R Junior',
        description: 'Enfants de moins de 11 ans',
        yearlyPrice: 41820,
        monthlyPrice: 3485,
        renewal: 'annual',
        profiles: ['junior_school'],
        requiredDocuments: ['family_booklet', 'school_certificate'],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'imagine_r_scolaire',
        name: 'Imagine R Scolaire',
        description: 'Eleves de 11 a 25 ans',
        yearlyPrice: 41820,
        monthlyPrice: 3485,
        renewal: 'annual',
        profiles: ['school'],
        requiredDocuments: ['school_certificate'],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'imagine_r_etudiant',
        name: 'Imagine R Etudiant',
        description: 'Etudiants de 18 a 28 ans',
        yearlyPrice: 41820,
        monthlyPrice: 3485,
        renewal: 'annual',
        profiles: ['student'],
        requiredDocuments: ['school_certificate'],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'liberte_plus',
        name: 'Navigo Liberte+',
        description: "Paiement a l'usage",
        yearlyPrice: null,
        monthlyPrice: null,
        renewal: 'usage',
        profiles: ['employee', 'student', 'senior'],
        requiredDocuments: [],
        meta: { zones: { min: 1, max: 5 }, pricePerTripCents: 52 },
      },
      {
        id: 'tst_50',
        name: 'TST Reduction 50%',
        description: 'Aide transport 50%',
        yearlyPrice: 51840,
        monthlyPrice: 4320,
        renewal: 'quarterly',
        profiles: ['tst'],
        requiredDocuments: ['caf_certificate', 'tax_notice'],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'tst_75',
        name: 'TST Solidarite 75%',
        description: 'Aide transport 75%',
        yearlyPrice: 25920,
        monthlyPrice: 2160,
        renewal: 'quarterly',
        profiles: ['tst'],
        requiredDocuments: ['caf_certificate', 'tax_notice'],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'tst_gratuite',
        name: 'TST Gratuite',
        description: 'Transport gratuit',
        yearlyPrice: 0,
        monthlyPrice: 0,
        renewal: 'quarterly',
        profiles: ['tst'],
        requiredDocuments: ['caf_certificate', 'tax_notice'],
        meta: { zones: { min: 1, max: 5 } },
      },
      {
        id: 'amethyste',
        name: 'Amethyste',
        description: 'Personnes en situation de handicap',
        yearlyPrice: null,
        monthlyPrice: null,
        renewal: 'annual',
        profiles: ['amethyste'],
        requiredDocuments: ['disability_card', 'mdph_notification'],
        meta: { zones: { min: 1, max: 5 } },
      },
    ])
    .onConflictDoNothing()

  const passwordHash = await bcrypt.hash('password123', 10)

  await db
    .insert(users)
    .values([
      {
        email: 'employee@test.com',
        passwordHash,
        firstName: 'Jean',
        lastName: 'Dupont',
        profile: 'employee',
        gdprConsent: true,
        gdprConsentAt: new Date(),
      },
      {
        email: 'student@test.com',
        passwordHash,
        firstName: 'Marie',
        lastName: 'Martin',
        profile: 'student',
        gdprConsent: true,
        gdprConsentAt: new Date(),
      },
      {
        email: 'tst@test.com',
        passwordHash,
        firstName: 'Ahmed',
        lastName: 'Benali',
        profile: 'tst',
        gdprConsent: true,
        gdprConsentAt: new Date(),
      },
    ])
    .onConflictDoNothing()
}

seed()
  .then(() => {
    console.log('Seed complete')
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
