import { boolean, integer, jsonb, date, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const userProfileEnum = pgEnum('user_profile', [
  'employee',
  'student',
  'junior_school',
  'school',
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

export const fraudLevelEnum = pgEnum('fraud_level', ['low', 'medium', 'high'])

export const consentTypeEnum = pgEnum('consent_type', ['rgpd', 'cookies', 'document_upload'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  profile: userProfileEnum('profile'),
  role: userRoleEnum('role').default('user').notNull(),
  language: varchar('language', { length: 5 }).default('fr'),
  gdprConsent: boolean('gdpr_consent').default(false),
  gdprConsentAt: timestamp('gdpr_consent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const offers = pgTable('offers', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  yearlyPrice: integer('yearly_price'),
  monthlyPrice: integer('monthly_price'),
  renewal: varchar('renewal', { length: 20 }),
  active: boolean('active').default(true),
  profiles: jsonb('profiles').notNull().default([]),
  requiredDocuments: jsonb('required_documents').notNull().default([]),
  meta: jsonb('meta'),
})

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  payerId: uuid('payer_id')
    .references(() => users.id)
    .notNull(),
  holderId: uuid('holder_id').references(() => users.id),
  holderLastName: varchar('holder_last_name', { length: 100 }),
  holderFirstName: varchar('holder_first_name', { length: 100 }),
  holderDateOfBirth: timestamp('holder_date_of_birth'),
  offerId: varchar('offer_id', { length: 50 })
    .references(() => offers.id)
    .notNull(),
  status: subscriptionStatusEnum('status').default('draft'),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  fraudScore: integer('fraud_score'),
  fraudLevel: fraudLevelEnum('fraud_level'),
  fraudSignals: jsonb('fraud_signals'),
  fraudCheckedAt: timestamp('fraud_checked_at'),
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
  aiIssues: jsonb('ai_issues'),
  validatedAt: timestamp('validated_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const holders = pgTable('holders', {
  id: uuid('id').defaultRandom().primaryKey(),
  payeurId: uuid('payer_id')
    .references(() => users.id)
    .notNull(),
  holderId: uuid('holder_id').references(() => users.id),
  nom: varchar('last_name', { length: 100 }).notNull(),
  prenom: varchar('first_name', { length: 100 }).notNull(),
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
