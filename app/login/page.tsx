"use client";

import { useState } from "react";
import { loginAction } from "@/server/admin/auth-actions";
import { Eye, EyeOff, Lock, User, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      // Jika error merupakan proses redirect Next.js, biarkan berjalan
      if (err?.digest?.includes('NEXT_REDIRECT')) {
        return;
      }
      setError("Terjadi kesalahan pada server atau koneksi.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      
      {/* --- ANIMASI BACKGROUND --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] animate-[blob_7s_infinite] z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-[blob_10s_infinite_2s] z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none z-1"></div>

      {/* --- CARD LOGIN --- */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_-12px_rgba(37,99,235,0.2)]">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">QC kain App</h1>
          <p className="text-blue-400/80 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Internal Access Only</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl text-sm mb-6 text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Username */}
          <div className="relative group">
            <User className="absolute left-4 top-4 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors z-10" />
            <input 
              name="username"
              type="text"
              className="w-full bg-white/[0.05] border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600 force-padding"
              placeholder="Username Pegawai"
              required
            />
          </div>

          {/* Input Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors z-10" />
            <input 
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full bg-white/[0.05] border border-white/10 p-4 pr-12 rounded-2xl text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600 force-padding"
              placeholder="Password"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-500 hover:text-blue-400 transition-colors z-10"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.97] flex items-center justify-center gap-3 mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "LOG IN SYSTEM"
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-10 tracking-wide">
          &copy; 2026  Qc kain app - Quality Control System
        </p>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .force-padding {
          padding-left: 3.5rem !important;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}