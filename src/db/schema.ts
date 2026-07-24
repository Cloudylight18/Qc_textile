import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  integer, 
  doublePrecision, 
  timestamp, 
  pgEnum 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUM DEFINITIONS ---
export const roleEnum = pgEnum('role', ['admin', 'inspector', 'pimpinan']);
export const fabricCategoryEnum = pgEnum('fabric_category', ['polosan', 'printing']);
export const gradeEnum = pgEnum('grade', ['A', 'B', 'C', 'Reject']);

// --- 1. Tabel Users ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), 
  role: roleEnum('role').notNull(),
  nama: text("nama"),
});

// --- 2. Tabel Suppliers ---
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  namaPerusahaan: varchar('nama_perusahaan', { length: 100 }).notNull(),
  alamat: text('alamat').notNull(),
  pic: varchar('pic', { length: 100 }).notNull(), 
  kontak: varchar('kontak', { length: 50 }).notNull(),
});

// --- 3. Tabel Fabric_Types (Master Data Teknis) ---
export const fabricTypes = pgTable('fabric_types', {
  id: serial('id').primaryKey(),
  namaKain: varchar('nama_kain', { length: 100 }).notNull(),
  targetLebar: doublePrecision('target_lebar').notNull(), 
  toleransiLebar: doublePrecision('toleransi_lebar').notNull(),
  targetGsmKiri: doublePrecision('target_gsm_kiri').notNull(),
  targetGsmTengah: doublePrecision('target_gsm_tengah').notNull(),
  targetGsmKanan: doublePrecision('target_gsm_kanan').notNull(),
  toleransiBerat: doublePrecision('toleransi_berat').notNull(),
  maxBowing: doublePrecision('max_bowing').notNull(), 
  maxSkewing: doublePrecision('max_skewing').notNull(), 
});

// --- 4. Tabel Orders (Header & Penugasan QC) ---
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  qcUserId1: integer('qc_user_id_1').references(() => users.id),
  qcUserId2: integer('qc_user_id_2').references(() => users.id),
  qcUserId3: integer('qc_user_id_3').references(() => users.id),
  tanggalOrder: timestamp('tanggal_order').defaultNow(),
  keterangan: text('keterangan'),
});

// --- 5. Tabel Order_Items (Detail Produksi) ---
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  fabricTypeId: integer('fabric_type_id').references(() => fabricTypes.id),
  kategori: fabricCategoryEnum('kategori').notNull(),
  warnaAtauDesain: varchar('warna_atau_desain', { length: 100 }),
  
  totalYardOrder: doublePrecision('total_yard_order').notNull(),
  totalMeterOrder: doublePrecision('total_meter_order').notNull().default(0),
  
  imageUrl: text('image_url'), 
  aiAnalysisResult: text('ai_analysis_result'),

  maxPointGradeA: integer('max_point_grade_a').default(20), 
  maxPointGradeB: integer('max_point_grade_b').default(40), 
  maxPointGradeC: integer('max_point_grade_c').default(60), 

  inspectedPercentage: doublePrecision('inspected_percentage').default(0),
  finalGrade: gradeEnum('final_grade'),
  keteranganItem: text('keterangan_item'),
});

// --- 6. Tabel Inspections (Hasil QC per Piece/Roll) ---
export const inspections = pgTable('inspections', {
  id: serial('id').primaryKey(),
  orderItemId: integer('order_item_id').references(() => orderItems.id),
  inspectorId: integer('inspector_id').references(() => users.id),
  nomorPiece: varchar('nomor_piece', { length: 50 }).notNull(), 
  lebarAktual: doublePrecision('lebar_aktual'),
  beratAktual: doublePrecision('berat_aktual'),
  gsmKiriAktual: doublePrecision('gsm_kiri_aktual'),
  gsmTengahAktual: doublePrecision('gsm_tengah_aktual'),
  gsmKananAktual: doublePrecision('gsm_kanan_aktual'),
  panjangYardAktual: doublePrecision('panjang_yard_aktual').default(0),
  panjangMeterAktual: doublePrecision('panjang_meter_aktual').default(0),
  bowingAktual: doublePrecision('bowing_aktual'), 
  skewingAktual: doublePrecision('skewing_aktual'),
  totalPoints: integer('total_points').default(0),
  pointsPer100Sqy: doublePrecision('points_per_100_sqy').default(0),
  grade: gradeEnum('grade'),
  tanggalInspeksi: timestamp('tanggal_inspeksi').defaultNow(),
  catatanInspector: text('catatan_inspector'), 
  keteranganPimpinan: text('keterangan_pimpinan'),
});

// --- 7. Tabel Defects (Detail Temuan Cacat per Roll) ---
export const defects = pgTable('defects', {
  id: serial('id').primaryKey(),
  inspectionId: integer('inspection_id').references(() => inspections.id),
  jenisDefect: varchar('jenis_defect', { length: 50 }).notNull(), 
  ukuranInci: doublePrecision('ukuran_inci').notNull(),
  poin: integer('poin').notNull(), 
  posisiYard: doublePrecision('posisi_yard').notNull(), 
  fotoDefectUrl: text('foto_defect_url'), 
});


//RELATIONS (SINKRONISASI RELASI DATABASE)
export const usersRelations = relations(users, ({ many }) => ({
  assignedOrders1: many(orders, { relationName: 'qc1' }),
  assignedOrders2: many(orders, { relationName: 'qc2' }),
  assignedOrders3: many(orders, { relationName: 'qc3' }),
  inspections: many(inspections), 
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  orders: many(orders),
}));

export const fabricTypesRelations = relations(fabricTypes, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [orders.supplierId], references: [suppliers.id] }),
  items: many(orderItems),
  qc1: one(users, { fields: [orders.qcUserId1], references: [users.id], relationName: 'qc1' }),
  qc2: one(users, { fields: [orders.qcUserId2], references: [users.id], relationName: 'qc2' }),
  qc3: one(users, { fields: [orders.qcUserId3], references: [users.id], relationName: 'qc3' }),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  fabricType: one(fabricTypes, { fields: [orderItems.fabricTypeId], references: [fabricTypes.id] }),
  inspections: many(inspections),
}));

// BARU DITAMBAHKAN: Relasi Inspections & Defects 
export const inspectionsRelations = relations(inspections, ({ one, many }) => ({
  orderItem: one(orderItems, { fields: [inspections.orderItemId], references: [orderItems.id] }),
  inspector: one(users, { fields: [inspections.inspectorId], references: [users.id] }),
  defects: many(defects), 
}));

export const defectsRelations = relations(defects, ({ one }) => ({
  inspection: one(inspections, { fields: [defects.inspectionId], references: [inspections.id] })
}));
