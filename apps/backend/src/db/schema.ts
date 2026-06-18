import { boolean, date, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const documentTypeEnum = pgEnum('document_type', [
  'cni',
  'certificat_scolarite',
  'attestation_caf',
  'carte_invalidite',
  'livret_famille',
  'inconnu',
])

export const notificationTypeEnum = pgEnum('notification_type', [
  'subscription_renewal',
  'subscription_active',
  'document_warning',
  'documents_required',
  'subscription_suspended',
  'payment_required',
  'fraud_alert',
  'subscription_draft',
  'tst_expiry',
])

export const profileEnum = pgEnum('profile', [
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

export const consentTypeEnum = pgEnum('consent_type', ['rgpd', 'cookies', 'document_upload'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  profile: profileEnum('profile'),
  role: userRoleEnum('role').default('user').notNull(),
  language: varchar('language', { length: 5 }).default('fr'),
  gdprConsent: boolean('gdpr_consent').default(false),
  gdprConsentAt: timestamp('gdpr_consent_at'),
  interests: jsonb('interests').$type<string[]>().default([]),
  points: integer('points').default(0),
  level: integer('level').default(1),
  badges: jsonb('badges').$type<string[]>().default([]),
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
  type: documentTypeEnum('type').notNull(),
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
  payerId: uuid('payer_id')
    .references(() => users.id)
    .notNull(),
  userId: uuid('user_id').references(() => users.id),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  canSelfManage: boolean('can_self_manage').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  type: notificationTypeEnum('type').notNull(),
  message: text('message').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const feedItemTypeEnum = pgEnum('feed_item_type', ['news', 'tip', 'promo', 'alert'])

export const feedItems = pgTable('feed_items', {
  id: varchar('id', { length: 100 }).primaryKey(),
  type: feedItemTypeEnum('type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body').notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  tag: varchar('tag', { length: 50 }).notNull(),
  relevantInterests: jsonb('relevant_interests').$type<string[]>().notNull().default([]),
  relevantProfiles: jsonb('relevant_profiles').$type<string[]>().notNull().default([]),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const tripLineTypeEnum = pgEnum('trip_line_type', ['metro', 'rer', 'bus', 'tram', 'transilien'])

export const trips = pgTable('trips', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  line: varchar('line', { length: 20 }).notNull(),
  toLine: varchar('to_line', { length: 20 }),
  lineType: tripLineTypeEnum('line_type').notNull(),
  from: varchar('from', { length: 100 }).notNull(),
  to: varchar('to', { length: 100 }).notNull(),
  departureTime: varchar('departure_time', { length: 5 }).notNull(),
  arrivalTime: varchar('arrival_time', { length: 5 }).notNull(),
  duration: integer('duration').notNull(),
  zones: jsonb('zones').$type<number[]>().notNull(),
  itineraryData: jsonb('itinerary_data'),
  co2Saved: integer('co2_saved').notNull(),
  tripDate: date('trip_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const alertTypeEnum = pgEnum('alert_type', ['perturbation', 'travaux', 'info'])

export const lineAlerts = pgTable('line_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  line: varchar('line', { length: 20 }).notNull(),
  lineType: tripLineTypeEnum('line_type').notNull(),
  type: alertTypeEnum('type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  active: boolean('active').default(true),
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
