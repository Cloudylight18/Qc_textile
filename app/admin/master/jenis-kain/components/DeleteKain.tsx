"use client";

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteKainAction } from "@/server/admin/kain-actions";

export default function DeleteKain({ id, nama }: { id: number, nama: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm group">
        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Terminate Data</h3>
                <p className="text-slate-500 text-xs font-medium">Hapus master data <span className="text-red-600 font-bold tracking-tight">{nama}</span>? Tindakan ini permanen.</p>
              </div>
            </div>
            
            <div className="flex border-t border-slate-100 h-20">
              <button onClick={() => setIsOpen(false)} className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Abort</button>
              <button 
                onClick={async () => {
                  setLoading(true);
                  await deleteKainAction(id);
                  setLoading(false);
                  setIsOpen(false);
                }}
                className="flex-[1.5] bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all active:bg-red-700"
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}