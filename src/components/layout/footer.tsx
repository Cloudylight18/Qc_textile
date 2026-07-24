"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto pt-10 pb-24 md:pb-10 px-6 md:px-8 border-t border-slate-800 bg-[#0f172a]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
        
        {/* Nama Sistem */}
        <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em] text-center md:text-left">
          &copy; 2026 PT 'A' — Quality Control System
        </p>
        
        {/* Animasi Nama Developer */}
        <div className="relative group">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 relative z-10 text-center">
            Developed by 
            <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-[length:200%_auto] animate-shimmer">
              RAFI DARAJAT
            </span>
          </p>
          <div className="absolute -inset-1 bg-blue-500/10 blur-xl group-hover:bg-blue-500/20 transition-all"></div>
        </div>

        {/* Status Indikator */}
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">System Operational</p>
        </div>
      </div>

      {/* Tailwind v4 Style Injection untuk custom keyframe shimmer */}
      <style jsx global>{`
        @keyframes shimmerLine {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          animation: shimmerLine 4s linear infinite;
        }
      `}</style>
    </footer>
  );
}