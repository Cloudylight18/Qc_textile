"use client";

import React, { useState, useEffect } from 'react';
import { Building2 } from "lucide-react";
import EditSupplier from "./components/EditSupplier";
import DeleteSupplier from "./components/DeleteSupplier";

interface Supplier {
  id: number;
  namaPerusahaan: string;
  pic: string | null;
  kontak: string | null;
  alamat: string | null;
}

// Pastikan menggunakan `export default`
export default function SuppliersTable({ allSuppliers = [] }: { allSuppliers: Supplier[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [allSuppliers]);

  const totalPages = Math.ceil(allSuppliers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = allSuppliers.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl flex flex-col mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-widest font-black text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50">
              <th className="px-6 py-5">Info Perusahaan</th>
              <th className="px-6 py-5">PIC & Kontak</th>
              <th className="px-6 py-5">Alamat</th>
              <th className="px-6 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Belum ada data supplier terdaftar.
                </td>
              </tr>
            ) : (
              currentData.map((supplier) => {
                const normalizedSupplier = {
                  ...supplier,
                  pic: supplier.pic || "",
                  kontak: supplier.kontak || "",
                  alamat: supplier.alamat || "",
                };

                return (
                  <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500 flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase">{supplier.namaPerusahaan}</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: SUPP-{supplier.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{supplier.pic || "-"}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{supplier.kontak}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">{supplier.alamat}</p>
                    </td>
                    <td className="px-6 py-5 text-right align-top">
                      <div className="flex justify-end gap-2 items-center">
                        <EditSupplier supplier={normalizedSupplier} />
                        <DeleteSupplier supplierId={supplier.id} supplierName={supplier.namaPerusahaan} />
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
      {allSuppliers.length > 0 && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, allSuppliers.length)} dari {allSuppliers.length} supplier
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