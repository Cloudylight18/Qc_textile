"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface TugasItem {
  id: number;
  orderId: number;
  fabricName: string;
  supplier: string;
  quantity: number;
  kategori: string;
  tanggal: Date | null;
}

export default function TugasContent({ queue = [] }: { queue: TugasItem[] }) {
  // State untuk Pagination (6 item per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset ke halaman 1 jika data berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [queue]);

  // Kalkulasi data untuk pagination
  const totalPages = Math.ceil(queue.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = queue.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl flex flex-col mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-widest font-black text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50">
              <th className="px-6 py-5">Order ID</th>
              <th className="px-6 py-5">Fabric Detail</th>
              <th className="px-6 py-5">Vendor</th>
              <th className="px-6 py-5">Tanggal</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Tidak ada antrean tugas saat ini.
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-5 align-top">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      #ORD-{item.orderId}
                    </span>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{item.fabricName}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      {item.kategori} — <span className="text-slate-700 dark:text-slate-300">{item.quantity} YDS</span>
                    </p>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest truncate max-w-[150px]">{item.supplier}</p>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}</p>
                  </td>
                  <td className="px-6 py-5 text-right align-top">
                    <Link href={`/inspector/check/${item.id}`} className="inline-flex items-center gap-2 bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-black/20">
                      Mulai QC <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr> 
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {queue.length > 0 && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, queue.length)} dari {queue.length} tugas
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