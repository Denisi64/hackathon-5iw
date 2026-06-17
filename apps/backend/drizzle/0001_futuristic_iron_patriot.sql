CREATE TYPE "public"."document_type" AS ENUM('cni', 'certificat_scolarite', 'attestation_caf', 'carte_invalidite', 'livret_famille', 'inconnu');--> statement-breakpoint
CREATE TYPE "public"."fraud_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('subscription_renewal', 'subscription_active', 'document_warning', 'documents_required', 'subscription_suspended', 'payment_required', 'fraud_alert', 'subscription_draft', 'tst_expiry');--> statement-breakpoint
CREATE TYPE "public"."offer_renewal" AS ENUM('annual', 'monthly', 'weekly', 'quarterly', 'usage');--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "type" SET DATA TYPE document_type USING type::document_type;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE notification_type USING type::notification_type;--> statement-breakpoint
ALTER TABLE "offers" ALTER COLUMN "renewal" SET DATA TYPE offer_renewal USING renewal::offer_renewal;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "fraud_level" SET DATA TYPE fraud_level USING fraud_level::fraud_level;
