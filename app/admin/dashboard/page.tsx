"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Activity, TrendingUp, Package, AlertCircle, RefreshCw } from "lucide-react";
import { getDashboardStats, DashboardStats } from "@/server/admin/admindashboard-action";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil data statistik dari Server Action
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
    // Initial fetch saat komponen pertama kali dimuat
    fetchStats();

    // Polling setiap 10 detik untuk mendapatkan update data real-time
    const interval = setInterval(() => {
      fetchStats(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="p-2 space-y-8 animate-in fade-in duration-700">
      {/* Header Overview */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between">
        <div>
          <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
            <Activity size={14} className="text-blue-500" /> Operational Overview
          </h2>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Production <span className="text-blue-500">Statistics</span>
          </h1>
        </div>

        {/* Indikator Status Auto-Refresh */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <RefreshCw
            size={14}
            className={`transition-transform ${isRefreshing ? "animate-spin text-blue-400" : ""}`}
          />
          <span className="hidden sm:inline">
            {isRefreshing ? "Syncing..." : "Real-time Live"}
          </span>
        </div>
      </div>

      {/* Menampilkan pesan error jika query database gagal */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Orders */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/30 transition-all">
          <TrendingUp className="text-blue-500 mb-4" size={24} />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Total Orders
          </p>
          <p className="text-3xl font-black text-white mt-1">
            {isLoading ? (
              <span className="inline-block w-16 h-8 bg-slate-800 animate-pulse rounded" />
            ) : (
              stats?.totalOrders.toLocaleString() ?? 0
            )}
          </p>
        </div>

        {/* Card 2: Active Fabrics */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/30 transition-all">
          <Package className="text-emerald-500 mb-4" size={24} />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Active Fabrics
          </p>
          <p className="text-3xl font-black text-white mt-1">
            {isLoading ? (
              <span className="inline-block w-16 h-8 bg-slate-800 animate-pulse rounded" />
            ) : (
              stats?.activeFabrics.toLocaleString() ?? 0
            )}
          </p>
        </div>

        {/* Card 3: Pending QC */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-amber-500/30 transition-all">
          <AlertCircle className="text-amber-500 mb-4" size={24} />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Pending QC
          </p>
          <p className="text-3xl font-black text-white mt-1">
            {isLoading ? (
              <span className="inline-block w-16 h-8 bg-slate-800 animate-pulse rounded" />
            ) : (
              stats?.pendingQC.toLocaleString() ?? 0
            )}
          </p>
        </div>
      </div>
    </div>
  );
}