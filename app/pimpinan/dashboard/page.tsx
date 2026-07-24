"use client";
import React, { useState, useEffect } from "react";
import { getPimpinanReport } from "@/server/pimpinan/pimpinan-actions";
import { 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown,
  ChevronRight,
  Download
} from "lucide-react";

export default function PimpinanDashboard() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    getPimpinanReport().then(res => setReport(res));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">
            Executive <span className="text-indigo-500">Analytics</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-[0.2em] uppercase">Laporan Kualitas Produksi PT Dewa Sutratex II</p>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          <Download size={14} /> Export Report
        </button>
      </header>

      {/* Row 1: High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/10 p-8 rounded-[2.5rem]">
          <ShieldCheck className="text-indigo-500 mb-4" size={32} />
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Global Quality Score</p>
          <h2 className="text-4xl font-black mt-1">{(100 - (report?.avgQuality || 0)).toFixed(1)}%</h2>
        </div>
        <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem]">
          <TrendingDown className="text-amber-500 mb-4" size={32} />
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Avg Points / 100 Sqy</p>
          <h2 className="text-4xl font-black mt-1">{Number(report?.avgQuality || 0).toFixed(2)}</h2>
        </div>
        <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem]">
          <AlertTriangle className="text-red-500 mb-4" size={32} />
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Critical Defects</p>
          <h2 className="text-4xl font-black mt-1">{report?.topDefects?.length || 0} <span className="text-sm font-normal text-gray-500">Types</span></h2>
        </div>
      </div>

      {/* Row 2: Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top 5 Jenis Cacat */}
        <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem]">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <BarChart3 className="text-indigo-500" /> Top Fabric Defects
          </h3>
          <div className="space-y-6">
            {report?.topDefects.map((df: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>{df.jenis}</span>
                  <span className="text-indigo-400">{df.total} Temuan</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full" 
                    style={{ width: `${(df.total / report.topDefects[0].total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribusi Grade */}
        <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[3rem]">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <PieChart className="text-emerald-500" /> Grade Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {report?.gradeDist.map((g: any, i: number) => (
              <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-black mb-1 ${
                  g.grade === 'A' ? 'text-emerald-500' : 
                  g.grade === 'B' ? 'text-blue-500' : 
                  g.grade === 'C' ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {g.grade}
                </span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{g.count} Rolls</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 border border-indigo-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/10 transition-all">
            Lihat Detail Inspeksi Lengkap
          </button>
        </div>

      </div>
    </div>
  );
}