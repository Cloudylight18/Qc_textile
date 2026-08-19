import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Zap, BarChart3, Users } from "lucide-react";

export default function LandingPage() {
  return (
    // Kita kunci tingginya h-screen dan sembunyikan scroll overflow-hidden
    <div className="h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative selection:bg-blue-500/30">
      
      {/* Background Glow Effect - Dikecilkan biar nggak makan tempat */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Container Utama - flex-col dengan justify-between agar menyebar pas */}
      <main className="relative z-10 h-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-between">
        
        {/* Header / Top Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <Zap size={14} className="text-blue-600 fill-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
            Internal Control v1.0
          </span>
        </div>

        {/* Hero Section - Padding diringkas biar gak terlalu turun */}
        <div className="text-center flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] mb-6">
            Quality <span className="text-blue-600">Control</span><br />
            System <span className="text-slate-400">2026</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base font-medium max-w-xl leading-relaxed mb-8">
            aplikasi untuk memantau dan mengelola proses quality control di 
            <span className="text-slate-900 block md:inline font-bold"> PT 'A' </span>. 
            yang meliputi dari pembuatan order, menginspeck kain di lapangan,hingga laporan hasil inspeksi yang dapat diakses oleh pimpinan untuk evaluasi kualitas prodak.
          </p>

          {/* CTA Button */}
          <Link 
            href="/login" 
            className="group relative bg-blue-600 hover:bg-blue-500 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 overflow-hidden shadow-2xl shadow-blue-600/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <ShieldCheck size={18} />
            masuk system
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Features Row - Dibuat lebih ramping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          <div className="bg-white/50 border border-slate-200/50 p-5 rounded-[1.5rem] backdrop-blur-md flex items-start gap-4">
            <Users className="text-blue-500 shrink-0" size={20} />
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest italic mb-1">User Role</h3>
              <p className="text-[10px] text-slate-600 leading-tight">Admin, Inspector, & Pimpinan.</p>
            </div>
          </div>
          <div className="bg-white/50 border border-slate-200/50 p-5 rounded-[1.5rem] backdrop-blur-md flex items-start gap-4">
            <Zap className="text-emerald-500 shrink-0" size={20} />
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest italic mb-1">Real-time QC</h3>
              <p className="text-[10px] text-slate-600 leading-tight">Live defect input on-field.</p>
            </div>
          </div>
          <div className="bg-white/50 border border-slate-200/50 p-5 rounded-[1.5rem] backdrop-blur-md flex items-start gap-4">
            <BarChart3 className="text-indigo-500 shrink-0" size={20} />
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest italic mb-1">Analytics</h3>
              <p className="text-[10px] text-slate-600 leading-tight">Automated grade distribution.</p>
            </div>
          </div>
        </div>

        {/* Footer Minimalis */}
        <footer className="text-center">
          <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.6em]">
            Developed for PT 'A' &bull; 2026
          </p>
        </footer>
      </main>
    </div>
  );
}