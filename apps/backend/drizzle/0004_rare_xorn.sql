CREATE TYPE "public"."feed_item_type" AS ENUM('news', 'tip', 'promo', 'alert');--> statement-breakpoint
CREATE TYPE "public"."trip_line_type" AS ENUM('metro', 'rer', 'bus', 'tram', 'transilien');--> statement-breakpoint
CREATE TABLE "feed_items" (
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
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"line" varchar(20) NOT NULL,
	"line_type" "trip_line_type" NOT NULL,
	"from" varchar(100) NOT NULL,
	"to" varchar(100) NOT NULL,
	"departure_time" varchar(5) NOT NULL,
	"arrival_time" varchar(5) NOT NULL,
	"duration" integer NOT NULL,
	"zones" jsonb NOT NULL,
	"co2_saved" integer NOT NULL,
	"trip_date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;