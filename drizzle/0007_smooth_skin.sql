CREATE TABLE "knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
