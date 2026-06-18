import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://comutitres:comutitres_dev@localhost:5432/comutitres'
const sql = postgres(databaseUrl, { max: 1, onnotice: () => undefined })

async function enumExists(name: string) {
  const rows = await sql<{ exists: boolean }[]>`
    select exists (
      select 1
      from pg_type t
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typname = ${name}
    )
  `

  return rows[0]?.exists ?? false
}

async function createEnum(name: string, values: string[]) {
  if (await enumExists(name)) return

  const quotedValues = values.map((value) => `'${value.replaceAll("'", "''")}'`).join(', ')
  await sql.unsafe(`CREATE TYPE "public"."${name}" AS ENUM(${quotedValues})`)
}

async function columnType(tableName: string, columnName: string) {
  const rows = await sql<{ udt_name: string }[]>`
    select udt_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = ${tableName}
      and column_name = ${columnName}
  `

  return rows[0]?.udt_name
}

async function constraintExists(name: string) {
  const rows = await sql<{ exists: boolean }[]>`
    select exists (
      select 1
      from information_schema.table_constraints
      where constraint_schema = 'public' and constraint_name = ${name}
    )
  `

  return rows[0]?.exists ?? false
}

async function addConstraint(name: string, statement: string) {
  if (await constraintExists(name)) return

  await sql.unsafe(statement)
}

async function prepareEnums() {
  await createEnum('consent_type', ['rgpd', 'cookies', 'document_upload'])
  await createEnum('document_status', ['uploaded', 'validating', 'valid', 'rejected'])
  await createEnum('document_type', ['cni', 'certificat_scolarite', 'attestation_caf', 'carte_invalidite', 'livret_famille', 'inconnu'])
  await createEnum('feed_item_type', ['news', 'tip', 'promo', 'alert'])
  await createEnum('notification_type', [
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
  await createEnum('profile', ['employee', 'student', 'junior_school', 'school', 'senior', 'tst', 'amethyste'])
  await createEnum('subscription_status', ['draft', 'pending_documents', 'pending_payment', 'active', 'suspended', 'cancelled', 'expired'])
  await createEnum('trip_line_type', ['metro', 'rer', 'bus', 'tram', 'transilien'])
  await createEnum('user_role', ['user', 'porteur'])
  await createEnum('alert_type', ['perturbation', 'travaux', 'info'])
}

async function prepareTables() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" varchar(255) NOT NULL UNIQUE,
      "password_hash" varchar(255),
      "first_name" varchar(100) NOT NULL,
      "last_name" varchar(100) NOT NULL,
      "date_of_birth" timestamp,
      "profile" "profile",
      "role" "user_role" DEFAULT 'user' NOT NULL,
      "language" varchar(5) DEFAULT 'fr',
      "gdpr_consent" boolean DEFAULT false,
      "gdpr_consent_at" timestamp,
      "interests" jsonb DEFAULT '[]'::jsonb,
      "points" integer DEFAULT 0,
      "level" integer DEFAULT 1,
      "badges" jsonb DEFAULT '[]'::jsonb,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp DEFAULT now()
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "offers" (
      "id" varchar(50) PRIMARY KEY NOT NULL,
      "name" varchar(100) NOT NULL,
      "description" text,
      "yearly_price" integer,
      "monthly_price" integer,
      "renewal" varchar(20),
      "active" boolean DEFAULT true
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "subscriptions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "payer_id" uuid NOT NULL,
      "holder_id" uuid,
      "holder_last_name" varchar(100),
      "holder_first_name" varchar(100),
      "holder_date_of_birth" timestamp,
      "offer_id" varchar(50) NOT NULL,
      "status" "subscription_status" DEFAULT 'draft',
      "stripe_subscription_id" varchar(255),
      "stripe_customer_id" varchar(255),
      "fraud_score" integer,
      "fraud_level" varchar(10),
      "fraud_signals" jsonb,
      "start_date" timestamp,
      "end_date" timestamp,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp DEFAULT now()
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "documents" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "subscription_id" uuid NOT NULL,
      "type" "document_type" NOT NULL,
      "minio_key" varchar(255) NOT NULL,
      "status" "document_status" DEFAULT 'uploaded',
      "ai_confidence" integer,
      "ai_extracted_data" text,
      "validated_at" timestamp,
      "expires_at" timestamp,
      "created_at" timestamp DEFAULT now()
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "holders" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "payer_id" uuid NOT NULL,
      "user_id" uuid,
      "last_name" varchar(100) NOT NULL,
      "first_name" varchar(100) NOT NULL,
      "date_of_birth" date NOT NULL,
      "can_self_manage" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now()
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "notifications" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "type" "notification_type" NOT NULL,
      "message" text NOT NULL,
      "read_at" timestamp,
      "created_at" timestamp DEFAULT now()
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "feed_items" (
      "id" varchar(100) PRIMARY KEY NOT NULL,
      "type" "feed_item_type" NOT NULL,
      "title" varchar(200) NOT NULL,
      "body" text NOT NULL,
      "emoji" varchar(10) NOT NULL,
      "tag" varchar(50) NOT NULL,
      "relevant_interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "relevant_profiles" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "active" boolean DEFAULT true,
      "created_at" timestamp DEFAULT now()
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "trips" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "line" varchar(20) NOT NULL,
      "to_line" varchar(20),
      "line_type" "trip_line_type" NOT NULL,
      "from" varchar(100) NOT NULL,
      "to" varchar(100) NOT NULL,
      "departure_time" varchar(5) NOT NULL,
      "arrival_time" varchar(5) NOT NULL,
      "duration" integer NOT NULL,
      "zones" jsonb NOT NULL,
      "itinerary_data" jsonb,
      "co2_saved" integer NOT NULL,
      "trip_date" date NOT NULL,
      "created_at" timestamp DEFAULT now()
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "line_alerts" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "line" varchar(20) NOT NULL,
      "line_type" "trip_line_type" NOT NULL,
      "type" "alert_type" NOT NULL,
      "title" varchar(200) NOT NULL,
      "message" text NOT NULL,
      "start_date" date NOT NULL,
      "end_date" date,
      "active" boolean DEFAULT true,
      "created_at" timestamp DEFAULT now()
    )
  `)

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "consents" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "type" "consent_type" NOT NULL,
      "accepted" boolean NOT NULL,
      "accepted_at" timestamp NOT NULL
    )
  `)
}

async function prepareColumns() {
  const statements = [
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "interests" jsonb DEFAULT '[]'::jsonb`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "points" integer DEFAULT 0`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "level" integer DEFAULT 1`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "badges" jsonb DEFAULT '[]'::jsonb`,
    `ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "to_line" varchar(20)`,
    `ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "itinerary_data" jsonb`,
  ]

  for (const statement of statements) {
    await sql.unsafe(statement)
  }

  if ((await columnType('documents', 'type')) !== 'document_type') {
    await sql.unsafe(`ALTER TABLE "documents" ALTER COLUMN "type" SET DATA TYPE "public"."document_type" USING "type"::text::"public"."document_type"`)
  }

  if ((await columnType('notifications', 'type')) !== 'notification_type') {
    await sql.unsafe(`ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::text::"public"."notification_type"`)
  }

  if ((await columnType('offers', 'renewal')) !== 'varchar') {
    await sql.unsafe(`ALTER TABLE "offers" ALTER COLUMN "renewal" SET DATA TYPE varchar(20) USING "renewal"::text`)
  }

  if ((await columnType('subscriptions', 'fraud_level')) !== 'varchar') {
    await sql.unsafe(`ALTER TABLE "subscriptions" ALTER COLUMN "fraud_level" SET DATA TYPE varchar(10) USING "fraud_level"::text`)
  }

  await sql.unsafe(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`)
}

async function prepareConstraints() {
  await addConstraint(
    'consents_user_id_users_id_fk',
    `ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  )
  await addConstraint(
    'documents_subscription_id_subscriptions_id_fk',
    `ALTER TABLE "documents" ADD CONSTRAINT "documents_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action`,
  )
  await addConstraint(
    'holders_payer_id_users_id_fk',
    `ALTER TABLE "holders" ADD CONSTRAINT "holders_payer_id_users_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  )
  await addConstraint(
    'holders_user_id_users_id_fk',
    `ALTER TABLE "holders" ADD CONSTRAINT "holders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  )
  await addConstraint(
    'notifications_user_id_users_id_fk',
    `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  )
  await addConstraint(
    'subscriptions_payer_id_users_id_fk',
    `ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_payer_id_users_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  )
  await addConstraint(
    'subscriptions_holder_id_users_id_fk',
    `ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_holder_id_users_id_fk" FOREIGN KEY ("holder_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  )
  await addConstraint(
    'subscriptions_offer_id_offers_id_fk',
    `ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action`,
  )
  await addConstraint(
    'trips_user_id_users_id_fk',
    `ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`,
  )
}

async function prepareDatabase() {
  await prepareEnums()
  await prepareTables()
  await prepareColumns()
  await prepareConstraints()
}

prepareDatabase()
  .then(async () => {
    await sql.end()
    console.log('Database schema prepared')
  })
  .catch(async (error: unknown) => {
    await sql.end()
    console.error(error)
    process.exit(1)
  })
