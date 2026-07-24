ALTER TABLE "order_items" ALTER COLUMN "order_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "total_meter_order" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "lebar_inci";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "status_order";--> statement-breakpoint
DROP TYPE "public"."order_status";