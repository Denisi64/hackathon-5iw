ALTER TABLE "offers" ALTER COLUMN "renewal" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "fraud_level" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "interests" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "points" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "level" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "badges" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
DROP TYPE "public"."fraud_level";--> statement-breakpoint
DROP TYPE "public"."offer_renewal";