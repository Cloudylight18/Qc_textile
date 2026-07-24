CREATE TABLE "master_defects" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode_defect" varchar(20) NOT NULL,
	"nama_defect" varchar(100) NOT NULL,
	"kategori" varchar(50),
	"deskripsi" text,
	"gambar_url" text,
	"supplier_id" integer NOT NULL,
	CONSTRAINT "master_defects_kode_defect_unique" UNIQUE("kode_defect")
);
--> statement-breakpoint
ALTER TABLE "master_defects" ADD CONSTRAINT "master_defects_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;