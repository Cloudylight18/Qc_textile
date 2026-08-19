import React from 'react';
import { db } from "@/db";
import { orderItems, orders, inspections } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { Activity, CheckCircle, Clock, AlertTriangle, Layers, ListChecks } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic'; // Memastikan data selalu up-to-date (real-time fetch)

export default async function InspectorDashboard() {
  // 1. Ambil Antrean Tugas
  const queue = await db.select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id));

  // 2. Ambil Riwayat Inspeksi
  const finishedInspections = await db.select({
    id: inspections.id,
    grade: inspections.grade,
  }).from(inspections);

  // 3. Kalkulasi
  const totalPending = queue.length;
  const totalInspected = finishedInspections.length;
  const gradeA = finishedInspections.filter(i => i.grade === 'A').length;
  const reject = finishedInspections.filter(i => i.grade === 'Reject' || i.grade === 'C').length;

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto p-4 md:p-8 text-slate-900 dark:text-white">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
            Dashboard <span className="text-blue-600">QC Inspector</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Performance & Analytics Monitor
          </p>
        </div>
      </div>

      {/* QUICK LINKS / MENU CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/inspector/tugas" 
          className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center gap-5 hover:border-blue-500 hover:shadow-xl transition-all group"
        >
          <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
            <ListChecks size={28}/>
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-wider text-sm">Tugas Inspeksi</h3>
            <p className="text-slate-500 text-xs font-medium mt-0.5">Lihat antrean roll kain</p>
          </div>
        </Link>

        <Link 
          href="/inspector/defect" 
          className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center gap-5 hover:border-rose-500 hover:shadow-xl transition-all group"
        >
          <div className="bg-rose-500/10 p-4 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
            <Layers size={28}/>
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-wider text-sm">Katalog Defect</h3>
            <p className="text-slate-500 text-xs font-medium mt-0.5">Database cacat pabrik</p>
          </div>
        </Link>
      </div>

      {/* STATISTIK UTAMA (REAL-TIME) */}
      <div className="pt-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
          <Activity size={16} className="text-blue-500"/> Live Quality Report
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Clock size={56} className="text-blue-500"/></div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest relative z-10">Antrean (Pending)</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white italic mt-2 relative z-10">{totalPending}</p>
          </div>

          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-6 opacity-10"><CheckCircle size={56} className="text-emerald-500"/></div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest relative z-10">Roll Diinspeksi</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white italic mt-2 relative z-10">{totalInspected}</p>
          </div>

          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Activity size={56} className="text-amber-500"/></div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest relative z-10">Lolos Grade A</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white italic mt-2 relative z-10">{gradeA}</p>
          </div>

          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-6 opacity-10"><AlertTriangle size={56} className="text-rose-500"/></div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest relative z-10">Kritis / Reject</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white italic mt-2 relative z-10">{reject}</p>
          </div>

        </div>
      </div>
      
    </div>
  );
}