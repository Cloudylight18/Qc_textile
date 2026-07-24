import React from 'react';
import { db } from "@/db";
import { fabricTypes } from "@/db/schema";
import { 
  Layers, 
  Ruler, 
  Weight, 
  Printer,
  Palette
} from "lucide-react";

import CreateKain from "./components/CreateKain";
import EditKain from "./components/EditKain";
import DeleteKain from "./components/DeleteKain";

export default async function FabricTypesPage() {
  const allFabrics = await db.select().from(fabricTypes);
  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 bg-transparent">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
            Data <span className="text-blue-600">Jenis Kain</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 italic">
            PT 'A'   — data Jenis kain untuk quality control
          </p>
        </div>
        <CreateKain />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-600 backdrop-blur-md border border-white/30 p-6 rounded-[2rem] shadow-sm">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Order</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-slate-900 italic leading-none">{allFabrics.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase pb-1">Items</p>
          </div>
        </div>
        
        <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-600/20 flex flex-col justify-center">
          <p className="text-[8px] font-black text-blue-100 uppercase tracking-widest mb-1">Active Standard</p>
          <p className="text-xl font-black text-white italic uppercase tracking-tight">International 4-Point</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allFabrics.map((fabric: any) => (
          <div 
            key={fabric.id} 
            className="group bg-white/40 backdrop-blur-md border border-white/30 rounded-[2.5rem] p-8 hover:bg-white/70 transition-all shadow-sm relative overflow-hidden"
          >
            <Layers className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-200/40 -rotate-12 group-hover:text-blue-200/40 transition-colors pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl shadow-sm ${
                  fabric.kategori === 'printing' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {fabric.kategori === 'printing' ? <Printer size={20} /> : <Palette size={20} />}
                </div>
                
                <div className="flex gap-2">
                   <EditKain fabric={fabric} />
                   <DeleteKain id={fabric.id} nama={fabric.namaKain} />
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                  ID: FAB-{fabric.id.toString().padStart(3, '0')}
                </p>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                  {fabric.namaKain}
                </h3>
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                  {fabric.kategori || "Standard"} category
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Ruler size={12} className="text-slate-400" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Width Tol</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 italic">±{fabric.toleransiLebar}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Weight size={12} className="text-slate-400" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Weight Tol</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 italic">±{fabric.toleransiBerat}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {allFabrics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white/10 border-2 border-dashed border-white/30 rounded-[3rem]">
          <div className="p-6 bg-white/50 rounded-full mb-4">
            <Layers className="text-slate-300" size={48} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Database is currently empty</p>
        </div>
      )}
    </div>
  );
}