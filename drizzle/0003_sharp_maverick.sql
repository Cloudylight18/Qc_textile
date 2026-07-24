ALTER TABLE "inspections" ADD COLUMN "panjang_yard_aktual" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "inspections" ADD COLUMN "panjang_meter_aktual" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "max_point_grade_c" integer DEFAULT 60;