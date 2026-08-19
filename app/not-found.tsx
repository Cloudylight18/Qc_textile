"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  const pathname = usePathname();

  // Menentukan tujuan dashboard secara dinamis berdasarkan URL saat ini
  let dashboardHref = "/inspector";
  let dashboardLabel = "Kembali ke Dashboard Inspector";

  if (pathname?.startsWith("/pimpinan")) {
    dashboardHref = "/pimpinan/dashboard";
    dashboardLabel = "Kembali ke Executive Dashboard";
  } else if (pathname?.startsWith("/admin")) {
    dashboardHref = "/admin/dashboard";
    dashboardLabel = "Kembali ke Admin Dashboard";
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050810] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2rem] shadow-2xl max-w-md w-full relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute -top-10 -right-10 text-rose-500/5 pointer-events-none">
          <AlertTriangle size={150} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-rose-100 dark:bg-rose-500/10 p-5 rounded-full text-rose-500 mb-6">
            <AlertTriangle size={48} />
          </div>
          
          <h1 className="text-6xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-2">
            404
          </h1>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-4">
            Jalur Terenkripsi / Tidak Ditemukan
          </h2>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-8 leading-relaxed">
            URL yang Anda masukkan salah, tidak memiliki izin akses, atau data telah dipindahkan ke direktori aman.
          </p>

          <div className="flex flex-col w-full gap-3">
            <Link 
              href={dashboardHref} 
              className="w-full bg-blue-600 text-white px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Home size={16} /> {dashboardLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}