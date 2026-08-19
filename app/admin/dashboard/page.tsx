"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Activity, TrendingUp, Package, AlertCircle, RefreshCw, Users, Truck, Layers } from "lucide-react";
import { getDashboardStats, DashboardStats } from "@/server/admin/admindashboard-action";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    const result = await getDashboardStats();

    if (result.success && result.data) {
      setStats(result.data);
      setError(null);
    } else {
      setError(result.error || "Gagal memuat data.");
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Header Overview */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <h2 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
            <Activity size={14} className="text-blue-500 animate-pulse" /> data admin
          </h2>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
            Dashboard  <span className="text-blue-500">Admin</span>
          </h1>
        </div>

        {/* Indikator Status Auto-Refresh */}
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl text-xs text-slate-500 dark:text-slate-400 font-mono">
          <RefreshCw
            size={14}
            className={`transition-transform ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
          />
          <span className="dark:text-slate-400">{isRefreshing ? "Syncing Database..." : "Real-time Live (10s)"}</span>
        </div>
      </div>

      {/* Menampilkan pesan error jika query database gagal */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-semibold flex items-center gap-3">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Grid Statistik Utama (6 Cards Profesional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Total Orders */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 p-6 rounded-[2rem] hover:border-blue-500/40 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={22} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Orders</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {isLoading ? <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /> : (stats?.totalOrders.toLocaleString() ?? 0)}
          </p>
          <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-2 font-medium">Order produksi terdaftar</p>
        </div>

        {/* Card 2: Active Fabrics / Jenis Kain */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 p-6 rounded-[2rem] hover:border-emerald-500/40 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
            <Layers size={22} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Master Jenis Kain</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {isLoading ? <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /> : (stats?.totalFabricTypes.toLocaleString() ?? 0)}
          </p>
          <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-2 font-medium">Spesifikasi teknis kain aktif</p>
        </div>

        {/* Card 3: Total Suppliers */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 p-6 rounded-[2rem] hover:border-indigo-500/40 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <Truck size={22} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Supplier</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {isLoading ? <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /> : (stats?.totalSuppliers.toLocaleString() ?? 0)}
          </p>
          <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-2 font-medium">Mitra supplier tekstil</p>
        </div>

        {/* Card 4: Total Users */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 p-6 rounded-[2rem] hover:border-purple-500/40 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Pengguna Sistem</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {isLoading ? <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /> : (stats?.totalUsers.toLocaleString() ?? 0)}
          </p>
          <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-2 font-medium">Admin, Inspector, & Pimpinan</p>
        </div>

        {/* Card 5: Total Yards Ordered */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 p-6 rounded-[2rem] hover:border-cyan-500/40 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
            <Package size={22} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Yard Dipesan</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {isLoading ? <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /> : `${(stats?.totalYardsOrdered ?? 0).toLocaleString()} Yard`}
          </p>
          <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-2 font-medium">Akumulasi volume order kain</p>
        </div>

        {/* Card 6: Pending QC */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 p-6 rounded-[2rem] hover:border-amber-500/40 transition-all shadow-xl group">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
            <AlertCircle size={22} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Pending QC Inspection</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {isLoading ? <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" /> : (stats?.pendingQC.toLocaleString() ?? 0)}
          </p>
          <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-2 font-medium">Item belum diinspeksi</p>
        </div>

      </div>

      {/* Bagian Bawah: Recent Order Activity dengan Scroll ke Bawah & ke Samping (Maksimal ~6 item terlihat) */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Recent Order Activity</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Tampilan maksimal ~6 item • Scroll ke bawah & ke samping bebas</p>
          </div>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Live Stream
          </span>
        </div>

        {/* KONTAINER SCROLL BEBAS: max-h-[420px] untuk ~6 item, overflow-y-auto & overflow-x-auto */}
        <div className="max-h-[420px] overflow-y-auto overflow-x-auto pr-2 custom-scrollbar">
          <div className="min-w-[650px] space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="w-full h-16 bg-slate-200 dark:bg-slate-800/40 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-4 rounded-2xl flex items-center justify-between gap-4 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 font-black text-xs shrink-0">
                      #{order.id}
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-black text-xs uppercase">{order.supplierName}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 font-medium">{order.keterangan}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <p className="text-slate-700 dark:text-slate-300 text-xs font-bold">{order.totalYards.toLocaleString()} Yard</p>
                      <p className="text-slate-500 text-[10px]">{order.tanggalOrder}</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">
                      Active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                Belum ada data order produksi tercatat.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}