CREATE TYPE "public"."document_status" AS ENUM('uploaded', 'validating', 'valid', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."fraud_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."profil" AS ENUM('salarie', 'etudiant', 'scolaire_junior', 'scolaire', 'senior', 'tst', 'amethyste');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('draft', 'pending_documents', 'pending_payment', 'active', 'suspended', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"minio_key" varchar(255) NOT NULL,
	"status" "document_status" DEFAULT 'uploaded',
	"ai_confidence" integer,
	"ai_extracted_data" text,
	"ai_issues" jsonb,
	"validated_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"nom" varchar(100) NOT NULL,
	"description" text,
	"prix_an" integer,
	"prix_mois" integer,
	"renouvellement" varchar(20),
	"actif" boolean DEFAULT true,
	"profils" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"justificatifs_requis" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payeur_id" uuid NOT NULL,
	"porteur_id" uuid,
	"porteur_nom" varchar(100),
	"porteur_prenom" varchar(100),
	"porteur_ddn" timestamp,
	"offer_id" varchar(50) NOT NULL,
	"status" "subscription_status" DEFAULT 'draft',
	"stripe_subscription_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"fraud_score" integer,
	"fraud_level" "fraud_level",
	"fraud_signals" jsonb,
	"fraud_checked_at" timestamp,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"date_of_birth" timestamp,
	"profil" "profil",
	"language" varchar(5) DEFAULT 'fr',
	"rgpd_consent" boolean DEFAULT false,
	"rgpd_consent_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_payeur_id_users_id_fk" FOREIGN KEY ("payeur_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_porteur_id_users_id_fk" FOREIGN KEY ("porteur_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;