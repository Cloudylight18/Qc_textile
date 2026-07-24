"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteOrderAction } from "@/server/inspector/orderdetail-actions";

interface DeleteOrderProps {
  orderId: number;
  onSuccess: () => void;
}

export default function DeleteOrder({ orderId, onSuccess }: DeleteOrderProps) {
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
      <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !loading && setIsOpen(false)} />
      
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-lg">
            <AlertTriangle size={40} />
          </div>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">DELETE <span className="text-red-500">ORDER?</span></h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                 Anda akan menghapus data <span className="text-white underline"> ORD-{orderId ? orderId.toString().padStart(4, '0') : '????'}
               </span> secara permanen.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsOpen(false)} 
              disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-[#1e293b] text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
            >
              CANCEL
            </button>
            <button 
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                const res = await deleteOrderAction(orderId);
                if (res.success) {
                  onSuccess();
                  setIsOpen(false);
                }
                setLoading(false);
              }}
              className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all disabled:bg-red-900"
            >
              {loading ? "DELETING..." : "CONFIRM"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
        <Trash2 size={16} />
      </button>
      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
}