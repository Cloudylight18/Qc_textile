import React from 'react';
import { db } from "@/db";
import { orderItems, fabricTypes, orders, suppliers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import TugasContent from "./TugasContent";

export const dynamic = 'force-dynamic';

export default async function TugasPage() {
  const queue = await db.select({
    id: orderItems.id,
    orderId: orders.id,
    fabricName: fabricTypes.namaKain,
    supplier: suppliers.namaPerusahaan,
    quantity: orderItems.totalYardOrder,
    kategori: orderItems.kategori,
    tanggal: orders.tanggalOrder
  })
  .from(orderItems)
  .innerJoin(orders, eq(orderItems.orderId, orders.id))
  .innerJoin(fabricTypes, eq(orderItems.fabricTypeId, fabricTypes.id))
  .innerJoin(suppliers, eq(orders.supplierId, suppliers.id))
  .orderBy(desc(orders.tanggalOrder));

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto p-4 md:p-8 text-slate-900 dark:text-white">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
            Daftar <span className="text-blue-600">Tugas</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Antrean pengecekan kain (4-Point System).
          </p>
        </div>
      </div>

      {/* Konten Tabel & Pagination */}
      <TugasContent queue={queue} />
    </div>
  );
}