import bcrypt from 'bcryptjs'
import { db } from './index'
import { offers, users } from './schema'

async function seed() {
  await db
    .insert(offers)
    .values([
      {
        id: 'navigo_annuel',
        nom: 'Navigo Annuel',
        description: 'Abonnement annuel tout-reseau',
        prixAn: 90240,
        prixMois: 7520,
        renouvellement: 'annuel',
      },
      {
        id: 'navigo_senior',
        nom: 'Navigo Annuel Senior',
        description: 'Tarif preferentiel 62 ans et plus',
        prixAn: 63360,
        prixMois: 5280,
        renouvellement: 'annuel',
      },
      {
        id: 'navigo_mois',
        nom: 'Navigo Mois',
        description: 'Sans engagement mensuel',
        prixAn: 103680,
        prixMois: 8640,
        renouvellement: 'mensuel',
      },
      {
        id: 'navigo_semaine',
        nom: 'Navigo Semaine',
        description: 'Usage ponctuel par semaine',
        prixAn: 159900,
        prixMois: 12300,
        renouvellement: 'hebdomadaire',
      },
      {
        id: 'imagine_r_junior',
        nom: 'Imagine R Junior',
        description: 'Enfants de moins de 11 ans',
        prixAn: 41820,
        prixMois: 3485,
        renouvellement: 'annuel',
      },
      {
        id: 'imagine_r_scolaire',
        nom: 'Imagine R Scolaire',
        description: 'Eleves de 11 a 25 ans',
        prixAn: 41820,
        prixMois: 3485,
        renouvellement: 'annuel',
      },
      {
        id: 'imagine_r_etudiant',
        nom: 'Imagine R Etudiant',
        description: 'Etudiants de 18 a 28 ans',
        prixAn: 41820,
        prixMois: 3485,
        renouvellement: 'annuel',
      },
      {
        id: 'liberte_plus',
        nom: 'Navigo Liberte+',
        description: "Paiement a l'usage",
        prixAn: null,
        prixMois: null,
        renouvellement: 'usage',
      },
      {
        id: 'tst_50',
        nom: 'TST Reduction 50%',
        description: 'Aide transport 50%',
        prixAn: 51840,
        prixMois: 4320,
        renouvellement: 'trimestriel',
      },
      {
        id: 'tst_75',
        nom: 'TST Solidarite 75%',
        description: 'Aide transport 75%',
        prixAn: 25920,
        prixMois: 2160,
        renouvellement: 'trimestriel',
      },
      {
        id: 'tst_gratuite',
        nom: 'TST Gratuite',
        description: 'Transport gratuit',
        prixAn: 0,
        prixMois: 0,
        renouvellement: 'trimestriel',
      },
      {
        id: 'amethyste',
        nom: 'Amethyste',
        description: 'Personnes en situation de handicap',
        prixAn: null,
        prixMois: null,
        renouvellement: 'annuel',
      },
    ])
    .onConflictDoNothing()

  const passwordHash = await bcrypt.hash('password123', 10)

  await db
    .insert(users)
    .values([
      {
        email: 'salarie@test.com',
        passwordHash,
        firstName: 'Jean',
        lastName: 'Dupont',
        profil: 'salarie',
        rgpdConsent: true,
        rgpdConsentAt: new Date(),
      },
      {
        email: 'etudiant@test.com',
        passwordHash,
        firstName: 'Marie',
        lastName: 'Martin',
        profil: 'etudiant',
        rgpdConsent: true,
        rgpdConsentAt: new Date(),
      },
      {
        email: 'tst@test.com',
        passwordHash,
        firstName: 'Ahmed',
        lastName: 'Benali',
        profil: 'tst',
        rgpdConsent: true,
        rgpdConsentAt: new Date(),
      },
    ])
    .onConflictDoNothing()
}

seed()
  .then(() => {
    console.log('Seed termine')
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
