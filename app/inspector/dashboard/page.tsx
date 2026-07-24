import React from 'react';
import { db } from "@/db";
import { orderItems, fabricTypes, orders, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function InspectorDashboard() {
  const queue = await db.select({
    id: orderItems.id,
    orderId: orders.id,
    fabricName: fabricTypes.namaKain,
    supplier: suppliers.namaPerusahaan,
    quantity: orderItems.totalYardOrder,
    kategori: orderItems.kategori,
  })
  .from(orderItems)
  .innerJoin(orders, eq(orderItems.orderId, orders.id))
  .innerJoin(fabricTypes, eq(orderItems.fabricTypeId, fabricTypes.id))
  .innerJoin(suppliers, eq(orders.supplierId, suppliers.id));

  return (
    
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
          Dashboard <span className="text-blue-600">Inspector</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-1 italic">
          PT 'A'— Quality Control Department
        </p>
      </div>

      {/* Stats Mini - Disesuaikan dengan style box Inventory */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0b0f19] border border-slate-800 p-6 rounded-2xl">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pending Task</p>
          <p className="text-2xl font-black text-white italic mt-1">{queue.length}</p>
        </div>
      </div>

      {/* Table Queue - Mengikuti style tabel Inventory */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">
              <th className="px-8 py-6">Order ID</th>
              <th className="px-8 py-6">Fabric Detail</th>
              <th className="px-8 py-6">Vendor</th>
              <th className="px-8 py-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {queue.map((item) => (
              <tr key={item.id} className="hover:bg-slate-900/50 transition-all">
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-500/20">
                    #ORD-{item.orderId}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-white uppercase italic tracking-tight">{item.fabricName}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{item.kategori} — {item.quantity} YDS</p>
                </td>
                <td className="px-8 py-6">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.supplier}</p>
                </td>
                <td className="px-8 py-6">
                  <Link href={`/inspector/check/${item.id}`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                    Order Detail <ArrowRight size={12} />
                  </Link>
                </td>
              </tr> 
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}