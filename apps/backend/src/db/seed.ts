import bcrypt from 'bcryptjs'
import { db } from './index'
import { offers, users } from './schema'

async function seed() {
  await db
    .insert(offers)
    .values([
      { id: 'navigo_yearly', name: 'Navigo Annuel', description: 'Abonnement annuel tout-reseau', yearlyPrice: 90240, monthlyPrice: 7520, renewal: 'annual' },
      { id: 'navigo_senior', name: 'Navigo Annuel Senior', description: 'Tarif preferentiel 62 ans et plus', yearlyPrice: 63360, monthlyPrice: 5280, renewal: 'annual' },
      { id: 'navigo_month', name: 'Navigo Mois', description: 'Sans engagement mensuel', yearlyPrice: 103680, monthlyPrice: 8640, renewal: 'monthly' },
      { id: 'navigo_week', name: 'Navigo Semaine', description: 'Usage ponctuel par semaine', yearlyPrice: 159900, monthlyPrice: 12300, renewal: 'weekly' },
      { id: 'navigo_day', name: 'Navigo Jour', description: 'Usage ponctuel a la journee', yearlyPrice: null, monthlyPrice: null, renewal: 'day' },
      { id: 'imagine_r_junior', name: 'Imagine R Junior', description: 'Enfants de moins de 11 ans', yearlyPrice: 41820, monthlyPrice: 3485, renewal: 'annual' },
      { id: 'imagine_r_school', name: 'Imagine R Scolaire', description: 'Eleves de 11 a 25 ans', yearlyPrice: 41820, monthlyPrice: 3485, renewal: 'annual' },
      { id: 'imagine_r_student', name: 'Imagine R Etudiant', description: 'Etudiants de 18 a 28 ans', yearlyPrice: 41820, monthlyPrice: 3485, renewal: 'annual' },
      { id: 'liberty_plus', name: 'Navigo Liberte+', description: "Paiement a l'usage", yearlyPrice: null, monthlyPrice: null, renewal: 'usage' },
      { id: 'navigo_discount_50', name: 'TST Reduction 50%', description: 'Aide transport 50%', yearlyPrice: 51840, monthlyPrice: 4320, renewal: 'quarterly' },
      { id: 'navigo_solidarity_75', name: 'TST Solidarite 75%', description: 'Aide transport 75%', yearlyPrice: 25920, monthlyPrice: 2160, renewal: 'quarterly' },
      { id: 'navigo_free', name: 'TST Gratuite', description: 'Transport gratuit', yearlyPrice: 0, monthlyPrice: 0, renewal: 'quarterly' },
      { id: 'amethyst', name: 'Amethyste', description: 'Personnes en situation de handicap', yearlyPrice: null, monthlyPrice: null, renewal: 'annual' },
    ])
    .onConflictDoNothing()

  const passwordHash = await bcrypt.hash('password123', 10)

  await db
    .insert(users)
    .values([
      { email: 'salarie@test.com', passwordHash, firstName: 'Jean', lastName: 'Dupont', profile: 'employee', gdprConsent: true, gdprConsentAt: new Date() },
      { email: 'etudiant@test.com', passwordHash, firstName: 'Marie', lastName: 'Martin', profile: 'student', gdprConsent: true, gdprConsentAt: new Date() },
      { email: 'solidarite@test.com', passwordHash, firstName: 'Ahmed', lastName: 'Benali', profile: 'tst', gdprConsent: true, gdprConsentAt: new Date() },
      { email: 'parent@test.com', passwordHash, firstName: 'Sophie', lastName: 'Leroy', profile: 'employee', gdprConsent: true, gdprConsentAt: new Date() },
    ])
    .onConflictDoNothing()
}

seed()
  .then(() => { console.log('Seed done'); process.exit(0) })
  .catch((error: unknown) => { console.error(error); process.exit(1) })
