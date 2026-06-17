import { boolean, date, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const profilEnum = pgEnum('profil', [
  'salarie',
  'etudiant',
  'scolaire_junior',
  'scolaire',
  'senior',
  'tst',
  'amethyste',
])

export const userRoleEnum = pgEnum('user_role', ['user', 'porteur'])

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'draft',
  'pending_documents',
  'pending_payment',
  'active',
  'suspended',
  'cancelled',
  'expired',
])

export const documentStatusEnum = pgEnum('document_status', ['uploaded', 'validating', 'valid', 'rejected'])

export const consentTypeEnum = pgEnum('consent_type', ['rgpd', 'cookies', 'document_upload'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  profil: profilEnum('profil'),
  role: userRoleEnum('role').default('user').notNull(),
  language: varchar('language', { length: 5 }).default('fr'),
  rgpdConsent: boolean('rgpd_consent').default(false),
  rgpdConsentAt: timestamp('rgpd_consent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const offers = pgTable('offers', {
  id: varchar('id', { length: 50 }).primaryKey(),
  nom: varchar('nom', { length: 100 }).notNull(),
  description: text('description'),
  prixAn: integer('prix_an'),
  prixMois: integer('prix_mois'),
  renouvellement: varchar('renouvellement', { length: 20 }),
  actif: boolean('actif').default(true),
})

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  payeurId: uuid('payeur_id')
    .references(() => users.id)
    .notNull(),
  porteurId: uuid('porteur_id').references(() => users.id),
  porteurNom: varchar('porteur_nom', { length: 100 }),
  porteurPrenom: varchar('porteur_prenom', { length: 100 }),
  porteurDdn: timestamp('porteur_ddn'),
  offerId: varchar('offer_id', { length: 50 })
    .references(() => offers.id)
    .notNull(),
  status: subscriptionStatusEnum('status').default('draft'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  fraudScore: integer('fraud_score'),
  fraudLevel: varchar('fraud_level', { length: 10 }),
  fraudSignals: jsonb('fraud_signals'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id')
    .references(() => subscriptions.id)
    .notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  minioKey: varchar('minio_key', { length: 255 }).notNull(),
  status: documentStatusEnum('status').default('uploaded'),
  aiConfidence: integer('ai_confidence'),
  aiExtractedData: text('ai_extracted_data'),
  validatedAt: timestamp('validated_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const holders = pgTable('holders', {
  id: uuid('id').defaultRandom().primaryKey(),
  payeurId: uuid('payeur_id')
    .references(() => users.id)
    .notNull(),
  holderId: uuid('holder_id').references(() => users.id),
  nom: varchar('nom', { length: 100 }).notNull(),
  prenom: varchar('prenom', { length: 100 }).notNull(),
  ddn: date('ddn').notNull(),
  canSelfManage: boolean('can_self_manage').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  message: text('message').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const consents = pgTable('consents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  type: consentTypeEnum('type').notNull(),
  accepted: boolean('accepted').notNull(),
  acceptedAt: timestamp('accepted_at').notNull(),
})
