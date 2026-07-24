"use client";

import React, { useState } from 'react';
import { Plus, X, Layers, Ruler, Weight, Cpu } from 'lucide-react';
import { createKainAction } from "@/server/admin/kain-actions";

export default function CreateKain() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
      >
        <Plus size={16} /> Registrasi jenis kain baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 text-white">
            
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0f172a]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><Layers size={20} /></div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">Registrasi <span className="text-blue-500">Jenis Kain</span></h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">L-C-R GSM Standard Kain</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 transition-colors"><X size={24} /></button>
            </div>

            <form action={async (formData) => {
              setLoading(true);
              const res = await createKainAction(formData);
              setLoading(false);
              if(res.success) setIsOpen(false);
            }} className="p-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section Kiri: Identity & GSM */}
                 <div className="space-y-6">
                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-4 font-bold uppercase tracking-widest">
                     <h3 className="text-[10px] text-blue-500 italic flex items-center gap-2"><Layers size={14}/> Identity</h3>
                     <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-[8px] text-slate-500 ml-2 mb-1 block">Nama kain</label>
                          <input name="namaKain" required className="w-full bg-[#1e293b] border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 text-sm transition-all" placeholder="Cotton Combed 30s" />
                        </div>
                     </div>
                 </div>

                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-4 font-bold uppercase tracking-widest">
                     <h3 className="text-[10px] text-blue-500 italic flex items-center gap-2"><Weight size={14}/> GSM Target (L-C-R)</h3>
                     <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[7px] text-slate-500 mb-1 block text-center">Left</label>
                          <input name="targetGsmKiri" type="number" step="0.1" required className="w-full bg-[#1e293b] border border-white/10 p-3 rounded-xl text-center text-sm outline-none focus:border-blue-500" placeholder="180" />
                        </div>
                        <div>
                          <label className="text-[7px] text-slate-500 mb-1 block text-center">Center</label>
                          <input name="targetGsmTengah" type="number" step="0.1" required className="w-full bg-[#1e293b] border border-white/10 p-3 rounded-xl text-center text-sm outline-none focus:border-blue-500" placeholder="180" />
                        </div>
                        <div>
                          <label className="text-[7px] text-slate-500 mb-1 block text-center">Right</label>
                          <input name="targetGsmKanan" type="number" step="0.1" required className="w-full bg-[#1e293b] border border-white/10 p-3 rounded-xl text-center text-sm outline-none focus:border-blue-500" placeholder="180" />
                        </div>
                     </div>
                     <div className="mt-2">
                        <label className="text-[8px] text-blue-400 mb-1 block italic">Weight Tolerance (+/-)</label>
                        <input name="toleransiBerat" type="number" step="0.1" required className="w-full bg-[#1e293b] border border-blue-500/20 p-4 rounded-xl text-sm outline-none text-blue-400 font-black" placeholder="5.0" />
                     </div>
                  </div>
                </div>

                {/* Section Kanan: Width & Distortion */}
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-6 font-bold uppercase tracking-widest flex flex-col justify-center">
                   <h3 className="text-[10px] text-blue-500 italic flex items-center gap-2"><Ruler size={14}/> Width & Distortion Standards</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] text-slate-500 ml-2 block">Target Width (cm)</label>
                          <input name="targetLebar" type="number" step="0.1" required className="w-full bg-[#1e293b] border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="150" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-blue-400 ml-2 block italic">Width Tol (+/-)</label>
                          <input name="toleransiLebar" type="number" step="0.1" required className="w-full bg-[#1e293b] border border-blue-500/20 p-4 rounded-xl text-sm outline-none text-blue-400 font-black" placeholder="2.0" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 ml-2 block">Max Bowing (%)</label>
                        <input name="maxBowing" type="number" step="0.1" required className="w-full bg-[#1e293b] border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-blue-500" defaultValue="2.0" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] text-slate-500 ml-2 block">Max Skewing (%)</label>
                        <input name="maxSkewing" type="number" step="0.1" required className="w-full bg-[#1e293b] border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-blue-500" defaultValue="2.0" />
                      </div>
                   </div>
                   <div className="mt-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                      <p className="text-[7px] text-slate-400 leading-relaxed">
                        Data ini akan digunakan sebagai parameter utama dalam pengecekan Quality Control (QC) otomatis pada sistem Gudang Stock PT 'A'.
                      </p>
                   </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button 
                  disabled={loading} 
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 group border border-white/5"
                >
                  <Cpu size={18} className="group-hover:rotate-12 transition-transform" /> 
                  <span className="text-[11px]">
                    {loading ? "SYNCHRONIZING..." : "BUAT JENIS KAIN"}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}