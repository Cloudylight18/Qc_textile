import React from 'react';
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { 
  Factory, 
  User, 
  Phone, 
  MapPin, 
  Eye,
  Search
} from "lucide-react";
import Link from "next/link";

import CreateSupplier from "./components/CreateSupplier";
import EditSupplier from "./components/EditSupplier";
import DeleteSupplier from "./components/DeleteSupplier";

export default async function SuppliersPage() {
  const allSuppliers = await db.select().from(suppliers);

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 bg-[#020617] min-h-screen text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Data <span className="text-blue-500">Suppliers</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-1 italic">
            PT 'A' — Registry suppliers untuk quality control
          </p>
        </div>
        <CreateSupplier />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input 
          type="text" 
          placeholder="cari nama suppliers..." 
          className="w-full bg-[#0f172a] border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm text-white"
        />
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSuppliers.map((s) => (
          <div key={s.id} className="group bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 hover:border-blue-500/50 transition-all shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                <Factory size={24} />
              </div>
              <div className="flex gap-2">
                <EditSupplier supplier={s} />
                <DeleteSupplier supplierId={s.id} supplierName={s.namaPerusahaan} />
              </div>
            </div>

            <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-4 min-h-[3rem]">{s.namaPerusahaan}</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                  <User size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest"> Penanggung Jawab</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">{s.pic || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Phone size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Nomor Handphone</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">{s.kontak}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 mt-1 shrink-0">
                  <MapPin size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Alamat</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase leading-relaxed line-clamp-2">{s.alamat}</p>
                </div>
              </div>
            </div>

            <Link href={`/admin/master/suppliers/${s.id}`} className="w-full py-4 bg-[#1e293b] text-white rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all group-hover:scale-[1.02] border border-slate-700">
              <Eye size={14} /> Details
            </Link>
          </div>
        ))}
      </div>

      {allSuppliers.length === 0 && (
        <div className="text-center py-20 bg-[#0f172a] border border-dashed border-slate-800 rounded-[3rem]">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No suppliers</p>
        </div>
      )}
    </div>
  );
}