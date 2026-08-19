import React from 'react';
import { 
  getOrderWithInspections, 
  getInspectionsHistory 
} from "@/server/inspector/orderdetail-actions";
import { ChevronLeft, Plus, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import InspectionTableContent from "./InspectionTableContent";

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function OrderDetailsPage(props: PageProps) {
  // Tangkap dan resolve parameter dengan aman (Next.js 15 standard)
  const resolvedParams = props.params instanceof Promise ? await props.params : props.params;
  const rawId = resolvedParams?.id;
  const orderItemId = Number(rawId || 0);

  if (!rawId || isNaN(orderItemId) || orderItemId <= 0) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 text-white">
        <div className="bg-rose-950/30 p-8 rounded-3xl border border-rose-500/30 text-center space-y-4 max-w-lg">
          <AlertTriangle size={48} className="text-rose-500 mx-auto" />
          <h1 className="text-xl font-black text-rose-500">ID ORDER TIDAK VALID</h1>
          <p className="text-sm text-slate-400">Parameter ID tidak terbaca dengan benar dari URL.</p>
          <Link href="/inspector/tugas" className="inline-block mt-4 bg-slate-800 px-6 py-2 rounded-lg text-sm font-bold">Kembali ke Antrean</Link>
        </div>
      </div>
    );
  }

  // Tarik data dari database
  const [orderDetail, inspections] = await Promise.all([
    getOrderWithInspections(orderItemId),
    getInspectionsHistory(orderItemId)
  ]);

  if (!orderDetail) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 text-white">
        <div className="bg-amber-950/30 p-8 rounded-3xl border border-amber-500/30 text-center space-y-4 max-w-lg">
          <AlertTriangle size={48} className="text-amber-500 mx-auto" />
          <h1 className="text-xl font-black text-amber-500">DATA ORDER TIDAK DITEMUKAN</h1>
          <p className="text-sm text-slate-400">Order dengan ID <b>{orderItemId}</b> tidak ada di dalam database.</p>
          <Link href="/inspector/tugas" className="inline-block mt-4 bg-slate-800 px-6 py-2 rounded-lg text-sm font-bold">Kembali ke Antrean</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto p-4 md:p-8 text-slate-900 dark:text-white">
      {/* HEADER & BACK BUTTON */}
      <div>
        <Link href="/inspector/tugas" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Kembali ke Antrean
        </Link>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
          Detail <span className="text-blue-600">Inspeksi</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
          Quality Control Department | #ORD-{orderDetail.order?.id || orderItemId}
        </p>
      </div>

      {/* INFORMASI KAIN (CARD) */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] flex flex-col md:flex-row gap-8 justify-between items-start shadow-xl">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Vendor / Supplier</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white uppercase mt-0.5">
              {orderDetail.order?.supplier?.namaPerusahaan || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Spesifikasi Kain</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-500 uppercase italic tracking-tight mt-0.5">
              {orderDetail.fabricType?.namaKain || 'NAMA KAIN'}
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mt-1">
              {orderDetail.kategori} {orderDetail.warnaAtauDesain ? `— ${orderDetail.warnaAtauDesain}` : ''}
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl min-w-[200px] text-center shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Target Kuantitas</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white italic mt-2">{orderDetail.totalYardOrder}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Yards</p>
        </div>
      </div>

      {/* BAGIAN TABEL RIWAYAT & TOMBOL TAMBAH */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <FileText size={16} className="text-blue-600"/> Riwayat Pengecekan Roll
          </h2>
          
          <Link 
            href={`/inspector/check/${orderItemId}/inspect`}
            className="inline-flex bg-black hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all items-center gap-2 shadow-xl shadow-black/20"
          >
            <Plus size={14} /> Catat Inspeksi Baru
          </Link>
        </div>
        
        <InspectionTableContent inspections={inspections} orderItemId={orderItemId} />
      </div>
    </div>
  );
}