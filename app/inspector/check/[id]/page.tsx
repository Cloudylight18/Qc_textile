import React from 'react';
import { 
  getOrderWithInspections, 
  getInspectionsHistory, 
  deleteInspectionRecord 
} from "@/server/inspector/orderdetail-actions"; 
import { ChevronLeft, Plus, AlertCircle, FileText, Eye, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const orderItemId = parseInt(id);

  const [orderDetail, inspections] = await Promise.all([
    getOrderWithInspections(orderItemId),
    getInspectionsHistory(orderItemId)
  ]);

  if (!orderDetail) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER & BACK BUTTON */}
      <div>
        <Link href="/inspector" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Kembali ke Antrean
        </Link>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
          Detail <span className="text-blue-600">Inspeksi</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-1 italic">
          PT 'A'— Quality Control Department | #ORD-{orderDetail.orderId}
        </p>
      </div>

      {/* INFORMASI KAIN (CARD) */}
      <div className="bg-[#0b0f19] border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row gap-8 justify-between items-start">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Vendor / Supplier</p>
            <p className="text-xl font-bold text-white uppercase">
              {orderDetail.order?.supplier?.namaPerusahaan || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Spesifikasi Kain</p>
            <p className="text-2xl font-black text-blue-500 uppercase italic tracking-tight">
              {orderDetail.fabricType?.namaKain || 'NAMA KAIN'}
            </p>
            <p className="text-sm font-bold text-slate-300 uppercase mt-1">
              {orderDetail.kategori} {orderDetail.warnaAtauDesain ? `— ${orderDetail.warnaAtauDesain}` : ''}
            </p>
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl min-w-[200px] text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Target Kuantitas</p>
          <p className="text-4xl font-black text-white italic mt-2">{orderDetail.totalYardOrder}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1">Yards</p>
        </div>
      </div>

      {/* BAGIAN TABEL RIWAYAT & TOMBOL TAMBAH (FULL WIDTH) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <FileText size={16} className="text-blue-500"/> Riwayat Pengecekan Roll
          </h2>
          
          <Link 
            href={`/inspector/check/${orderItemId}/inspect`}
            className="inline-flex bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest px-6 py-3 rounded-lg transition-all items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus size={14} /> Catat Inspeksi Baru
          </Link>
        </div>
        
        {/* Tabel */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[9px] uppercase tracking-[0.2em] font-black text-slate-500 bg-slate-900/30">
                <th className="px-6 py-4">No. Piece/Roll</th>
                <th className="px-6 py-4">Panjang (YDS)</th>
                <th className="px-6 py-4">Poin Defect</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {inspections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <AlertCircle size={32} className="mb-3 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">Belum Ada Roll Yang Diinspeksi</p>
                      <p className="text-[10px] mt-1">Klik tombol "Catat Inspeksi Baru" untuk mulai mencatat hasil 4-Point System.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                inspections.map((insp: any) => {
                  const deleteAction = deleteInspectionRecord.bind(null, insp.id, orderItemId);
                  
                  return (
                    <tr key={insp.id} className="hover:bg-slate-900/50 transition-all">
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-white bg-slate-800 px-3 py-1.5 rounded-md">
                          {insp.rollNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-300">{insp.yardInspected} YDS</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-300">{insp.totalPoints} Pts</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-md border uppercase tracking-wider
                          ${insp.grade === 'A' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 
                            insp.grade === 'B' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 
                            insp.grade === 'C' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' :
                            'text-red-500 bg-red-500/10 border-red-500/20'}`}>
                          {insp.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/inspector/check/${orderItemId}/view/${insp.id}`} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-md transition-colors" title="Lihat Detail Roll">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/inspector/check/${orderItemId}/edit/${insp.id}`} className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-md transition-colors" title="Edit Data Roll">
                            <Edit2 size={14} />
                          </Link>
                          <form action={deleteAction}>
                            <button type="submit" className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors" title="Hapus Data Roll">
                              <Trash2 size={14} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}