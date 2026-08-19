"use client";

import React, { useState } from 'react';
import { UserPlus, X, Save, Eye, EyeOff } from "lucide-react";
import { registerUserAction } from "@/server/admin/auth-actions";

export default function CreateUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button 
      onClick={() => setIsOpen(true)}
      className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl shadow-black/20">
       <UserPlus className="w-4 h-4" /> Add New Staff
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="bg-[#0f172a] border border-white/5 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative text-left">
            
            {/* Tombol Close */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-200 mb-6">
              Register <span className="text-blue-600">New Staff</span>
            </h2>

            {/* Trick: Input tersembunyi untuk mengecoh Autofill Browser */}
            <form 
              action={async (formData) => {
                setLoading(true);
                const res = await registerUserAction(formData);
                setLoading(false);
                if (res.success) setIsOpen(false);
              }} 
              className="space-y-4"
              autoComplete="off"
            >
              {/* Fake inputs to prevent autofill */}
              <input type="text" style={{ display: 'none' }} />
              <input type="password" style={{ display: 'none' }} />
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Full Name</label>
                <input 
                  name="nama" 
                  type="text"
                  autoComplete="new-password"
                  placeholder="Contoh: Rafi Darajat" 
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" 
                  required 
                />
              </div>

              {/* Username (Tanpa Type Email agar tidak muncul gmail) */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Username</label>
                <input 
                  name="username" 
                  type="text"
                  autoComplete="new-password"
                  placeholder="Contoh: rafidx" 
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" 
                  required 
                />
              </div>

              {/* Password dengan fitur Mata & Font khusus agar tidak jadi titik-titik bulat besar */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Password</label>
                <div className="relative">
                  <input 
                    name="password" 
                    type={showPass ? "text" : "password"} 
                    autoComplete="new-password"
                    placeholder="Contoh: Dewa123!" 
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 tracking-[0.1em]" 
                    style={{ fontFamily: showPass ? 'inherit' : 'Verdana, sans-serif' }}
                    required 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Access Level</label>
                <select 
                  name="role" 
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none appearance-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="inspector" className="bg-[#0f172a]">Inspector (QC)</option>
                  <option value="admin" className="bg-[#0f172a]">Admin</option>
                  <option value="pimpinan" className="bg-[#0f172a]">Pimpinan</option>
                </select>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-2 transition-all"
              >
                {loading ? (
                  "Registering..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Register User
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}