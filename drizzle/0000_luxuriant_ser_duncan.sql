CREATE TYPE "public"."fabric_category" AS ENUM('polosan', 'printing');--> statement-breakpoint
CREATE TYPE "public"."grade" AS ENUM('A', 'B', 'C', 'Reject');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'on-process', 'completed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'inspector', 'pimpinan');--> statement-breakpoint
CREATE TABLE "defects" (
	"id" serial PRIMARY KEY NOT NULL,
	"inspection_id" integer,
	"jenis_defect" varchar(50) NOT NULL,
	"ukuran_inci" double precision NOT NULL,
	"poin" integer NOT NULL,
	"posisi_yard" double precision NOT NULL,
	"foto_defect_url" text
);
--> statement-breakpoint
CREATE TABLE "fabric_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_kain" varchar(100) NOT NULL,
	"kategori" "fabric_category" NOT NULL,
	"target_lebar" double precision NOT NULL,
	"toleransi_lebar" double precision NOT NULL,
	"target_gsm_kiri" double precision NOT NULL,
	"target_gsm_tengah" double precision NOT NULL,
	"target_gsm_kanan" double precision NOT NULL,
	"toleransi_berat" double precision NOT NULL,
	"max_bowing" double precision NOT NULL,
	"max_skewing" double precision NOT NULL,
	"foto_referensi" text,
	"deskripsi" text
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer,
	"inspector_id" integer,
	"nomor_piece" varchar(50) NOT NULL,
	"lebar_aktual" double precision,
	"berat_aktual" double precision,
	"bowing_aktual" double precision,
	"skewing_aktual" double precision,
	"total_points" integer DEFAULT 0,
	"points_per_100_sqy" double precision DEFAULT 0,
	"grade" "grade",
	"tanggal_inspeksi" timestamp DEFAULT now(),
	"keterangan_pimpinan" text
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"fabric_type_id" integer,
	"warna_motif" varchar(100),
	"total_yard_order" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"tanggal_buat" timestamp DEFAULT now(),
	"status_order" "order_status"
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_perusahaan" varchar(100) NOT NULL,
	"alamat" text NOT NULL,
	"pic" varchar(100) NOT NULL,
	"kontak" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" NOT NULL,
	"nama" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "defects" ADD CONSTRAINT "defects_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_fabric_type_id_fabric_types_id_fk" FOREIGN KEY ("fabric_type_id") REFERENCES "public"."fabric_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;