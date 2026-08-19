"use client";
import React, { useState, useEffect } from "react";
import { getPimpinanReport } from "@/server/pimpinan/pimpinan-actions";
import { 
  Activity, BarChart3, PieChart, ShieldCheck, TrendingDown,
  Download, Layers, Users, FileText, Building2, Tag,
  CheckCircle2, AlertTriangle, Clock, ChevronLeft, ChevronRight,
  Palette, Image as ImageIcon, X
} from "lucide-react";

interface PimpinanReport {
  avgQuality: number;
  totalRolls: number;
  topDefects: { jenis: string; total: number }[];
  gradeDist: { grade: string; count: number }[];
  inspectorStats: {
    inspectorId: number;
    inspectorName: string | null;
    inspectorUsername: string;
    totalInspected: number;
    avgScore: number;
  }[];
  detailedInspections: {
    nomorPiece: string;
    namaKain: string | null;
    warnaAtauDesain: string | null;
    namaSupplier: string | null;
    inspectorName: string | null;
    inspectorId: number;
    grade: string;
    pointsPer100Sqy: number | null;
    defects?: { jenisDefect: string; poin: number; ukuranInci: number; fotoDefectUrl: string | null }[];
  }[];
}

interface PimpinanReportResponse {
  success: boolean;
  data?: PimpinanReport;
}

export default function PimpinanDashboard() {
  const [report, setReport] = useState<PimpinanReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = (await getPimpinanReport()) as unknown as PimpinanReportResponse;
        if (response?.success && response.data) setReport(response.data);
      } catch (error) { console.error("Error fetching report:", error); } 
      finally { setLoading(false); }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050810] text-slate-800 dark:text-white flex items-center justify-center font-black tracking-widest text-xs uppercase animate-pulse">
        MEMUAT EXECUTIVE ANALYTICS...
      </div>
    );
  }

  const globalScore = 100 - Number(report?.avgQuality || 0);
  const detailedList = report?.detailedInspections || [];
  const totalPages = Math.ceil(detailedList.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDetailedData = detailedList.slice(indexOfFirstItem, indexOfLastItem);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleExportExcel = () => {
    if (!detailedList || detailedList.length === 0) {
      alert("Tidak ada data untuk diexport.");
      return;
    }

    let csvContent = "No. Roll,Jenis Kain,Warna/Desain,Supplier,Inspector,Grade,Penalty Pts,Defect & Foto\n";
    detailedList.forEach((item) => {
      const defectsStr = item.defects?.map(d => `${d.jenisDefect} (${d.poin} pts, Foto: ${d.fotoDefectUrl || 'Tidak ada'})`).join("; ") || "-";
      csvContent += `"${item.nomorPiece}","${item.namaKain || ''}","${item.warnaAtauDesain || '-'}","${item.namaSupplier || ''}","${item.inspectorName || ''}","${item.grade || ''}","${item.pointsPer100Sqy || 0}","${defectsStr}"\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; 
    link.download = `Laporan_Mutu_QC_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050810] text-slate-900 dark:text-white p-6 md:p-10 font-sans selection:bg-blue-600 selection:text-white pb-32 relative">
      
      {/* PHOTO MODAL (ZOOM POP-UP) */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <button 
            onClick={() => setSelectedPhoto(null)} 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer"
          >
            <X size={32} />
          </button>
          <img 
            src={selectedPhoto} 
            alt="Detail Defect" 
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10 object-contain" 
          />
        </div>
      )}

      {/* HEADER UTAMA PIMPINAN */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-1">
            <Activity size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">Executive Management Overview</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
            Executive <span className="text-blue-500">Analytics</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 uppercase tracking-wider">
            Dashboard Pemantauan Mutu Kain, Kinerja Inspector, & Evaluasi Supplier Berbasis 4-Point System
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Download size={14} /> Export to Excel (.csv)
          </button>
        </div>
      </div>

      {/* ROW 1: STATS UTAMA (EXECUTIVE CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <ShieldCheck className="text-blue-500 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Quality Index</p>
          <h2 className="text-4xl md:text-5xl font-black mt-2 text-slate-900 dark:text-white">{globalScore.toFixed(1)}%</h2>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Indeks Kepatuhan Mutu Pabrik</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <TrendingDown className="text-amber-500 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Avg Penalty / 100 Sqy</p>
          <h2 className="text-4xl md:text-5xl font-black mt-2 text-slate-900 dark:text-white">{Number(report?.avgQuality || 0).toFixed(2)}</h2>
          <div className="flex items-center gap-1.5 mt-2">
            <AlertTriangle size={13} className="text-amber-500" />
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Batas Normal Pabrik: &lt; 20.0 Pts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <Layers className="text-emerald-500 mb-4" size={32} />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Roll Terinspeksi</p>
          <h2 className="text-4xl md:text-5xl font-black mt-2 text-slate-900 dark:text-white">
            {report?.totalRolls || 0} <span className="text-lg font-bold text-slate-500">Rolls</span>
          </h2>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock size={13} className="text-emerald-500" />
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Akumulasi Seluruh Shift QC</span>
          </div>
        </div>
      </div>

      {/* ROW 2: CHARTS (DEFECTS & GRADE DISTRIBUTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* TOP FABRIC DEFECTS */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-3">
                <BarChart3 className="text-blue-500" /> Top Fabric Defects (Masalah Utama Kain)
              </h3>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Frekuensi Kasus</span>
            </div>

            <div className="space-y-6">
              {report?.topDefects && report.topDefects.length > 0 ? ( 
                report.topDefects.map((df, i) => {
                  const maxTotal = report.topDefects[0].total || 1;
                  const percentage = (df.total / maxTotal) * 100;
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px] font-black">#{i+1}</span>
                          {df.jenis}
                        </span>
                        <span className="text-blue-500 dark:text-blue-400 font-black">{df.total} Kasus</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 italic py-12 text-center">Belum ada data defect yang terekam.</p>
              )}
            </div>
          </div>
        </div>

        {/* GRADE DISTRIBUTION */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-3">
                <PieChart className="text-emerald-500" /> Grade Distribution (Distribusi Mutu)
              </h3>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Klasifikasi Mutu Kain</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {report?.gradeDist && report.gradeDist.length > 0 ? (
                report.gradeDist.map((g, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Grade {g.grade}</span>
                    <span className={`text-4xl font-black mb-1 ${
                      g.grade === 'A' ? 'text-emerald-500' : 
                      g.grade === 'B' ? 'text-blue-500' : 
                      g.grade === 'C' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {g.count} <span className="text-xs font-bold text-slate-500">Rolls</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-500 text-sm italic">Belum ada data distribusi grade.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: EVALUASI KINERJA INSPECTOR (QC) */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl mb-8">
        <div className="mb-6">
          <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-3">
            <Users className="text-blue-400" /> Evaluasi Kinerja Inspector (Petugas QC)
          </h3>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
            Statistik jumlah pemeriksaan dan rata-rata skor penalty per petugas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report?.inspectorStats && report.inspectorStats.length > 0 ? (
            report.inspectorStats.map((ins, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 dark:text-blue-400 font-black flex items-center justify-center text-sm border border-blue-500/20">
                    #{index + 1}
                  </div>
                  <span className="text-[9px] font-mono bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-600 dark:text-slate-400 uppercase font-bold">
                    @{ins.inspectorUsername}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 truncate">
                    {ins.inspectorName || "Inspector #" + ins.inspectorId}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase block tracking-widest">Total Diinspeksi</span>
                      <span className="text-base font-black text-blue-500">{ins.totalInspected} <span className="text-xs text-slate-500">Rolls</span></span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase block tracking-widest">Rata-rata Poin</span>
                      <span className="text-base font-black text-amber-500">{ins.avgScore.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center py-10 text-slate-500 text-xs uppercase italic">Belum ada data evaluasi inspector yang terekam.</p>
          )}
        </div>
      </div>

      {/* ROW 4: TABEL LOG DETAIL PRODUKSI DENGAN FOTO & PAGINATION (1-6) */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-3">
              <FileText className="text-emerald-400" /> Log Aktivitas, Kain & Bukti Visual Defect
            </h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
              Klik gambar thumbnail untuk memperbesar dan melihat detail cacat kain
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50">
                <th className="py-4 px-6">Roll</th>
                <th className="py-4 px-6">Jenis Kain & Warna</th>
                <th className="py-4 px-6">Supplier</th>
                <th className="py-4 px-6">Inspector</th>
                <th className="py-4 px-6">Bukti Defect & Foto Detail</th>
                <th className="py-4 px-6 text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
              {currentDetailedData.length > 0 ? (
                currentDetailedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors align-top">
                    <td className="py-5 px-6 font-black text-slate-800 dark:text-slate-200">
                      <span className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px]">
                        <Tag size={12} className="text-blue-500" />
                        {item.nomorPiece}
                      </span>
                    </td>
                    <td className="py-5 px-6 font-bold text-slate-700 dark:text-slate-300">
                      <p className="uppercase">{item.namaKain || "Kain Umum"}</p>
                      {item.warnaAtauDesain && (
                        <p className="text-[10px] font-normal text-slate-500 flex items-center gap-1 mt-0.5">
                          <Palette size={11} className="text-blue-500" /> {item.warnaAtauDesain}
                        </p>
                      )}
                    </td>
                    <td className="py-5 px-6 font-medium text-slate-600 dark:text-slate-400 uppercase">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400 shrink-0" />
                        <span>{item.namaSupplier || "-"}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 font-bold text-blue-600 dark:text-blue-400">
                      {item.inspectorName || "ID #" + item.inspectorId}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex flex-wrap gap-2">
                        {item.defects && item.defects.length > 0 ? (
                          item.defects.map((def, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                              {def.fotoDefectUrl ? (
                                <img 
                                  onClick={() => setSelectedPhoto(def.fotoDefectUrl)}
                                  src={def.fotoDefectUrl} 
                                  alt="defect" 
                                  className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:scale-105 ring-2 ring-transparent hover:ring-blue-500 transition-all shadow-sm" 
                                  title="Klik untuk memperbesar foto"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                              <div className="pr-2">
                                <p className="text-[9px] font-black text-rose-500 uppercase">{def.jenisDefect}</p>
                                <p className="text-[8px] font-bold text-slate-500">{def.poin} Pts | {def.ukuranInci}&quot;</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Bersih (Tanpa Cacat)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right font-black">
                      <span className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider inline-block ${
                        item.grade === 'A' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        item.grade === 'B' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        item.grade === 'C' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        GRADE {item.grade || 'REJECT'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 italic text-xs uppercase font-bold tracking-widest">
                    Belum ada log inspeksi produksi yang tercatat dalam sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER (1-6 PER HALAMAN) */}
        {detailedList.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, detailedList.length)} dari {detailedList.length} log aktivitas
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft size={14} className="mr-1" /> Prev
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all cursor-pointer ${
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
                className="px-3 h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}