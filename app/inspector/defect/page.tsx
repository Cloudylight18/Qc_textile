import React from 'react';
import { getDefects } from '@/server/inspector/defect-actions'; 
import TambahDefect from './components/tambahdefect';
import EditDefect from './components/editdefect'; 
import HapusDefect from './components/hapusdefect';
import { Search, AlertTriangle, MapPin, Hash, Factory, Calendar } from 'lucide-react';

export default async function DefectCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // PERBAIKAN: Resolve promise searchParams agar tidak error saat diketik
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  
  const defects = await getDefects(query);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050810] text-slate-800 dark:text-slate-300 p-6 md:p-10 animate-in fade-in">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
            Katalog <span className="text-blue-600">Defect</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-500 text-sm mt-1 font-medium">Manajemen dan pantau data defect material Gudang-stock.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <form method="GET" action="/inspector/defect" className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              name="q"
              type="text"
              defaultValue={query}
              placeholder="Tekan Enter untuk mencari..."
              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </form>
          <TambahDefect />
        </div>
      </div>

      <div className="mt-8">
        {defects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
            <AlertTriangle className="text-slate-400 dark:text-slate-600 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">
              {query ? `Pencarian "${query}" tidak ditemukan` : "Belum Ada Data Defect"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {defects.map((defect) => (
              <div key={defect.id} className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500 dark:hover:border-slate-600 transition-colors group shadow-lg flex flex-col">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {defect.fotoDefectUrl ? (
                    <img src={defect.fotoDefectUrl} alt={defect.jenisDefect} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-sm">Tidak ada foto</div>
                  )}
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Poin: {defect.poin}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide truncate">{defect.jenisDefect}</h3>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-500 mt-1">
                      <Hash size={14} /> <span className="text-xs font-mono">{defect.kodeDefect || "-"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-4 my-4 border-y border-slate-100 dark:border-slate-800/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600 flex items-center gap-1"><MapPin size={10} /> Yard</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{defect.posisiYard} Yd</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600 flex items-center gap-1"><Factory size={10} /> Supplier</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{defect.namaSupplier || "-"}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-600 text-[10px] font-medium">
                      <Calendar size={12} /> <span>{defect.createdAt || "Baru"}</span>
                    </div>
                    <div className="flex gap-2">
                      <EditDefect defect={defect} />
                      <HapusDefect id={defect.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}