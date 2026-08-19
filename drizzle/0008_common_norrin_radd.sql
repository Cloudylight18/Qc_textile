ALTER TABLE "users" ADD COLUMN "foto_profil" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_profile_update" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "update_count_today" integer DEFAULT 0;