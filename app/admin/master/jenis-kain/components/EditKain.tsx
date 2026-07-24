"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X, Save, RefreshCcw, Ruler, Weight, Layers } from 'lucide-react';
import { updateKainAction } from "@/server/admin/kain-actions";

export default function EditKain({ fabric }: { fabric: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Card Modal - Dibuat max-w-4xl supaya lebar seperti CreateKain */}
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 text-white">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
              <RefreshCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                Sync <span className="text-blue-600">Fabric Master</span>
              </h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">L-C-R GSM Technical Standard</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form 
          action={async (formData) => {
            setLoading(true);
            const res = await updateKainAction(fabric.id, formData);
            setLoading(false);
            if (res?.success) setIsOpen(false);
          }} 
          className="p-8 space-y-8"
          autoComplete="off"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Kolom Kiri: Identity & GSM */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-4 font-bold uppercase tracking-widest">
                <h3 className="text-[10px] text-blue-500 italic flex items-center gap-2"><Layers size={14}/> Identity</h3>
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 ml-2 block">Fabric Name</label>
                  <input 
                    name="namaKain" 
                    defaultValue={fabric.namaKain} 
                    className="w-full bg-[#1e293b] border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-blue-500 transition-all font-bold" 
                    required 
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-4 font-bold uppercase tracking-widest">
                <h3 className="text-[10px] text-blue-500 italic flex items-center gap-2"><Weight size={14}/> GSM Target (L-C-R)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-center block text-[7px] text-slate-500">Left</label>
                    <input name="targetGsmKiri" defaultValue={fabric.targetGsmKiri} className="w-full bg-[#1e293b] border border-white/10 p-3 rounded-xl text-center text-sm outline-none focus:border-blue-500" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-center block text-[7px] text-slate-500">Center</label>
                    <input name="targetGsmTengah" defaultValue={fabric.targetGsmTengah} className="w-full bg-[#1e293b] border border-white/10 p-3 rounded-xl text-center text-sm outline-none focus:border-blue-500" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-center block text-[7px] text-slate-500">Right</label>
                    <input name="targetGsmKanan" defaultValue={fabric.targetGsmKanan} className="w-full bg-[#1e293b] border border-white/10 p-3 rounded-xl text-center text-sm outline-none focus:border-blue-500" required />
                  </div>
                </div>
                <div className="pt-2">
                  <label className="text-[8px] text-blue-400 mb-1 block italic">Weight Tolerance Sync (+/-)</label>
                  <input name="toleransiBerat" defaultValue={fabric.toleransiBerat} className="w-full bg-[#1e293b] border border-blue-500/20 p-4 rounded-xl text-sm outline-none text-blue-400 font-black" required />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Width & Distortion */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-6 font-bold uppercase tracking-widest flex flex-col justify-center">
              <h3 className="text-[10px] text-blue-500 italic flex items-center gap-2"><Ruler size={14}/> Standards Sync</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-500 ml-2 block">Target Width (cm)</label>
                    <input name="targetLebar" defaultValue={fabric.targetLebar} className="w-full bg-[#1e293b] border border-white/10 p-4 rounded-xl text-sm outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-blue-400 ml-2 block italic">Width Tol Sync</label>
                    <input name="toleransiLebar" defaultValue={fabric.toleransiLebar} className="w-full bg-[#1e293b] border border-blue-500/20 p-4 rounded-xl text-sm outline-none text-blue-400" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 ml-2 block">Max Bowing (%)</label>
                  <input name="maxBowing" defaultValue={fabric.maxBowing} className="w-full bg-[#1e293b] border border-white/10 p-4 rounded-xl text-sm outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 ml-2 block">Max Skewing (%)</label>
                  <input name="maxSkewing" defaultValue={fabric.maxSkewing} className="w-full bg-[#1e293b] border border-white/10 p-4 rounded-xl text-sm outline-none" required />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 italic text-[7px] text-slate-400 text-center leading-relaxed">
                Pastikan data sinkron dengan standar Quality Control (QC) <br/> PT Dewa Sutratex sebelum melakukan pembaruan Master.
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all text-white shadow-xl shadow-blue-900/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              {loading ? "SYNCING CHANGES..." : "UPDATE MASTER DATA"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 bg-blue-500/5 border border-blue-500/10 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-blue-500 shadow-sm active:scale-90"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {/* Portal ke document.body */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}