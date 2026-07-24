"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit, X, Save } from 'lucide-react';
import { updateSupplierAction } from "@/server/admin/supplier-actions";

// Definisikan Interface untuk Props agar TypeScript tidak error (TS2322)
interface SupplierData {
  id: number;
  namaPerusahaan: string;
  pic: string | null;
  kontak: string;
  alamat: string;
}

interface EditSupplierProps {
  supplier: SupplierData;
}

export default function EditSupplier({ supplier }: EditSupplierProps) {
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
            UPDATE <span className="text-blue-500">SUPPLIER</span>
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
            <X size={24}/>
          </button>
        </div>

        <form action={async (formData) => {
          setLoading(true);
          const res = await updateSupplierAction(supplier.id, formData);
          setLoading(false);
          if (res?.success) setIsOpen(false);
        }} className="px-8 pb-8 space-y-4">
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-2">Factory Name</label>
            <input name="namaPerusahaan" defaultValue={supplier.namaPerusahaan} className="w-full bg-[#1e293b] border border-slate-700 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-white transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-2">PIC Name</label>
            <input name="pic" defaultValue={supplier.pic || ""} className="w-full bg-[#1e293b] border border-slate-700 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-white transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-2">Contact</label>
            <input name="kontak" defaultValue={supplier.kontak} className="w-full bg-[#1e293b] border border-slate-700 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-white transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-2">Address</label>
            <textarea name="alamat" defaultValue={supplier.alamat} className="w-full bg-[#1e293b] border border-slate-700 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-white min-h-[80px]" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-3">
            <Save size={18} /> {loading ? "UPDATING..." : "SAVE CHANGES"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2 text-slate-500 hover:text-blue-500 transition-colors">
        <Edit size={16} />
      </button>
      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
}