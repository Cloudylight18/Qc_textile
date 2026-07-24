"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Factory, X, Save, Plus } from 'lucide-react';
import { createSupplierAction } from "@/server/admin/supplier-actions";

export default function CreateSupplier() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
      <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
      
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 flex items-center justify-between">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
            REGISTER <span className="text-blue-500"> SUPPLIER</span>
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form action={async (formData) => {
          setLoading(true);
          const res = await createSupplierAction(formData);
          setLoading(false);
          if (res?.success) setIsOpen(false);
        }} className="px-8 pb-8 space-y-4">
          <input name="namaPerusahaan" placeholder="Nama perusahaan" className="w-full bg-[#1e293b] border border-slate-700 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-white placeholder:text-slate-500 transition-all" required />
          <input name="pic" placeholder="Nama penanggung jawab" className="w-full bg-[#1e293b] border border-slate-700 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-white placeholder:text-slate-500 transition-all" />
          <input name="kontak" placeholder="Nomor Handphone" className="w-full bg-[#1e293b] border border-slate-700 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-white placeholder:text-slate-500 transition-all" required />
          <textarea name="alamat" placeholder="Alamat Lengkap" className="w-full bg-[#1e293b] border border-slate-700 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-white placeholder:text-slate-500 min-h-[100px]" required />

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3">
            <Save size={18} /> {loading ? "REGISTERING..." : "BUAT SUPPLIER"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
        <Plus size={16} /> Registrasi Supplier
      </button>
      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
}