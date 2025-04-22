CREATE TYPE "public"."subscription" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" integer NOT NULL,
	"subscription" "subscription" DEFAULT 'free' NOT NULL,
	"subscription_expires_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" varchar(42) NOT NULL,
	"chain_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"user-id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
