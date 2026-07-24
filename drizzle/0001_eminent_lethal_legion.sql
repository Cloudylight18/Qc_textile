ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "supplier_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status_order" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "kategori" "fabric_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "warna_atau_desain" varchar(100);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "lebar_inci" double precision;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "ai_analysis_result" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "max_point_grade_a" integer DEFAULT 20;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "max_point_grade_b" integer DEFAULT 40;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "inspected_percentage" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "final_grade" "grade";--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "keterangan_item" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "qc_user_id_1" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "qc_user_id_2" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "qc_user_id_3" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tanggal_order" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "keterangan" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_qc_user_id_1_users_id_fk" FOREIGN KEY ("qc_user_id_1") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_qc_user_id_2_users_id_fk" FOREIGN KEY ("qc_user_id_2") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_qc_user_id_3_users_id_fk" FOREIGN KEY ("qc_user_id_3") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fabric_types" DROP COLUMN "kategori";--> statement-breakpoint
ALTER TABLE "fabric_types" DROP COLUMN "foto_referensi";--> statement-breakpoint
ALTER TABLE "fabric_types" DROP COLUMN "deskripsi";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "warna_motif";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "tanggal_buat";