"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteInspectionRecord } from "@/server/inspector/orderdetail-actions";

interface InspectionItem {
  id: number;
  rollNumber: string;
  yardInspected: number;
  totalPoints: number;
  grade: string;
}

export default function InspectionTableContent({ 
  inspections = [], 
  orderItemId 
}: { 
  inspections: InspectionItem[], 
  orderItemId: number 
}) {
  // State untuk Pagination (6 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset ke halaman 1 jika data berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [inspections]);

  // Kalkulasi data untuk pagination
  const totalPages = Math.ceil(inspections.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = inspections.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-widest font-black text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50">
              <th className="px-6 py-5">No. Piece/Roll</th>
              <th className="px-6 py-5">Panjang (YDS)</th>
              <th className="px-6 py-5">Poin Defect</th>
              <th className="px-6 py-5">Grade</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <AlertCircle size={32} className="mb-3 opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-widest">Belum Ada Roll Yang Diinspeksi</p>
                    <p className="text-[10px] mt-1">Klik tombol &quot;Catat Inspeksi Baru&quot; untuk mulai mencatat hasil 4-Point System.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((insp) => {
                const handleDelete = async () => {
                  await deleteInspectionRecord(insp.id, orderItemId);
                };
                
                return (
                  <tr key={insp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <span className="text-[10px] font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {insp.rollNumber}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-xs font-bold text-slate-700 dark:text-slate-300">{insp.yardInspected} YDS</td>
                    <td className="px-6 py-5 align-top text-xs font-bold text-slate-700 dark:text-slate-300">{insp.totalPoints} Pts</td>
                    <td className="px-6 py-5 align-top">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-wider
                        ${insp.grade === 'A' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 
                          insp.grade === 'B' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' : 
                          insp.grade === 'C' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' :
                          'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}>
                        {insp.grade}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right align-top">
                      <div className="flex items-center justify-end gap-2">
                        {/* Tombol Lihat Detail */}
                        <Link 
                          href={`/inspector/check/${orderItemId}/view/${insp.id}`} 
                          className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-colors" 
                          title="Lihat Detail Roll"
                        >
                          <Eye size={14} />
                        </Link>
                        
                        {/* Tombol Edit Data */}
                        <Link 
                          href={`/inspector/check/${orderItemId}/edit/${insp.id}`} 
                          className="p-2.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-colors" 
                          title="Edit Data Roll"
                        >
                          <Edit2 size={14} />
                        </Link>
                        
                        {/* Form Hapus dengan Konfirmasi Pop-up */}
                        <form 
                          action={handleDelete}
                          onSubmit={(e) => {
                            const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus data roll ini?");
                            if (!isConfirmed) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <button 
                            type="submit" 
                            className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors cursor-pointer" 
                            title="Hapus Data Roll"
                          >
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

      {/* PAGINATION FOOTER */}
      {inspections.length > 0 && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, inspections.length)} dari {inspections.length} riwayat
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 h-8 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Prev
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  currentPage === pageNumber
                    ? "bg-black text-white shadow-lg shadow-black/20 border border-black dark:border-slate-700"
                    : "bg-slate-200 dark:bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 h-8 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}