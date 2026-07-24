"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Import portal
import { Edit3, X, Save, Eye, EyeOff, UserCircle } from "lucide-react";
import { updateUserAction } from "@/server/admin/auth-actions";

export default function EditUser({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Pastikan komponen sudah terpasang di client side untuk Portal
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Kodingan Modal dipisah ke variabel agar rapi
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Card Modal */}
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-[480px] rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                Edit <span className="text-blue-600">Access</span>
              </h2>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form 
          action={async (formData) => {
            setLoading(true);
            const res = await updateUserAction(user.id, formData);
            setLoading(false);
            if (res?.success) setIsOpen(false);
          }} 
          className="p-8 space-y-5"
          autoComplete="off"
        >
          <input type="text" style={{ display: 'none' }} />
          <input type="password" style={{ display: 'none' }} />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
              <input name="nama" defaultValue={user.nama} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Username</label>
              <input name="username" defaultValue={user.username} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-blue-500 transition-all" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80 ml-1">New Password (Optional)</label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPass ? "text" : "password"} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-blue-500 transition-all tracking-[0.2em]" 
                  style={{ fontFamily: showPass ? 'inherit' : 'Verdana, sans-serif' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Role</label>
              <select name="role" defaultValue={user.role} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white outline-none appearance-none focus:border-blue-500">
                <option value="admin">ADMINISTRATOR</option>
                <option value="inspector">INSPECTOR (QC)</option>
                <option value="pimpinan">PIMPINAN</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all mt-4">
            {loading ? "Saving..." : <><Save className="w-4 h-4" /> Sync Changes</>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 bg-blue-500/5 border border-blue-500/10 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-blue-500"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {/* Trik Portal: Mengirim modalContent ke document.body */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}