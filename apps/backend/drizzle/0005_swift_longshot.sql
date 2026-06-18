CREATE TYPE "public"."alert_type" AS ENUM('perturbation', 'travaux', 'info');--> statement-breakpoint
CREATE TABLE "line_alerts" (
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
);
