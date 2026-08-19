import React from 'react';
import { db } from "@/db";
import { inspections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import Link from "next/navigation"; // or next/link

export const dynamic = 'force-dynamic';

export default async function ViewInspectionPage(props: { params: any }) {
  const resolvedParams = await props.params;
  const orderItemId = Number(resolvedParams?.id || 0);
  
  // Otomatis mendeteksi variasi nama folder apapun di kurung siku []
  const rawInspId = 
    resolvedParams?.inspectionid || 
    resolvedParams?.inspectionId || 
    resolvedParams?.inspectorid || 
    resolvedParams?.inspectorId;
    
  const inspectionId = Number(rawInspId || 0);

  if (!inspectionId || isNaN(inspectionId)) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 text-white">
        <div className="bg-rose-950/30 p-8 rounded-3xl border border-rose-500/30 text-center space-y-4 max-w-lg">
          <AlertTriangle size={48} className="text-rose-500 mx-auto" />
          <h1 className="text-xl font-black text-rose-500">PARAMETER ID TIDAK TERBACA</h1>
          <p className="text-sm text-slate-400">Parameter URL tidak cocok dengan struktur folder. Data diterima: {JSON.stringify(resolvedParams)}</p>
          <a href={`/inspector/check/${orderItemId}`} className="inline-block mt-4 bg-slate-800 px-6 py-2 rounded-lg text-sm font-bold">Kembali</a>
        </div>
      </div>
    );
  }

  const inspectionData = await db.query.inspections.findFirst({
    where: eq(inspections.id, inspectionId),
    with: { defects: true, inspector: true }
  });

  if (!inspectionData) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 text-white">
        <div className="bg-amber-950/30 p-8 rounded-3xl border border-amber-500/30 text-center space-y-4 max-w-lg">
          <AlertTriangle size={48} className="text-amber-500 mx-auto" />
          <h1 className="text-xl font-black text-amber-500">DATA TIDAK DITEMUKAN DI DATABASE</h1>
          <p className="text-sm text-slate-400">Data dengan ID <b>{inspectionId}</b> tidak ada di tabel database.</p>
          <a href={`/inspector/check/${orderItemId}`} className="inline-block mt-4 bg-slate-800 px-6 py-2 rounded-lg text-sm font-bold">Kembali</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050810] p-4 md:p-8 text-slate-900 dark:text-white animate-in duration-500 max-w-7xl mx-auto space-y-8">
      <a href={`/inspector/check/${orderItemId}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
        <ArrowLeft size={16} /> Kembali ke Detail Inspeksi
      </a>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6 mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Detail <span className="text-blue-600">Roll / Piece</span></h1>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Roll No: {inspectionData.nomorPiece}</p>
            </div>
            <div className={`px-6 py-2.5 rounded-2xl font-black italic tracking-tighter text-xl ${
                inspectionData.grade === 'A' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                inspectionData.grade === 'B' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}>
              GRADE {inspectionData.grade}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"><p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Panjang Aktual</p><p className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">{inspectionData.panjangYardAktual} <span className="text-xs text-slate-500">Yds</span></p></div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"><p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Lebar Aktual</p><p className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-200">{inspectionData.lebarAktual} <span className="text-xs text-slate-500">Inci</span></p></div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"><p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Total Poin</p><p className="text-xl font-bold mt-1 text-orange-500">{inspectionData.totalPoints} <span className="text-xs text-orange-500/50">Pts</span></p></div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"><p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Pts/100Y</p><p className="text-xl font-bold mt-1 text-blue-500">{inspectionData.pointsPer100Sqy}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}