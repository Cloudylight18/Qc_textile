"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Eye, 
  X,
 
  Hash, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  Box, 
  Ruler, 
  Layers,
  ChevronRight
} from "lucide-react";

interface Props {
  order: any;
  children: ReactNode; 
}

export default function DetailOrder({ order, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-5xl rounded-[3rem] my-auto shadow-2xl relative overflow-hidden">
        
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10" />
        
        {/* Header Section */}
        <div className="p-8 border-b border-white/5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Production Batch</span>
             <span className="text-gray-500 font-mono text-sm">
  #{order?.id ? order.id.toString().padStart(4, '0') : '0000'}
</span>
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Order <span className="text-blue-500">Specifications</span>
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all text-gray-400"><X/></button>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Grid Informasi Utama (Header) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 mb-4"><Building2 size={12}/> Origin</label>
              <p className="text-white font-bold text-lg">{order.supplier?.namaPerusahaan || "N/A"}</p>
              <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-tight">PT Dewa Sutratex II Partner</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-4"><Calendar size={12}/> Created Date</label>
              <p className="text-white font-bold text-lg">
                {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-tight">Timestamp: {new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-4"><User size={12}/> Assigned Inspectors</label>
              <div className="flex flex-wrap gap-2">
                {[order.qcUser1, order.qcUser2, order.qcUser3].map((user, i) => user && (
                  <span key={i} className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-300 border border-white/5">
                    {user.username.toUpperCase()}
                  </span>
                ))}
                {!order.qcUser1 && <span className="text-gray-600 text-xs italic">No inspectors assigned</span>}
              </div>
            </div>
          </div>

          {/* Tabel Daftar Kain (Multi-Item) */}
          <div className="space-y-4">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
              <Layers size={14}/> 01. Itemized Fabric Lists
            </label>
            
            <div className="overflow-hidden border border-white/5 rounded-[2.5rem] bg-white/[0.01]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Fabric Type</th>
                    <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</th>
                    <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Color / Design</th>
                    <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Order Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                             <Box size={18}/>
                          </div>
                          <span className="text-white font-bold text-sm uppercase">{item.fabricType?.name || "Kain"}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.kategori === 'printing' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="p-5 text-gray-300 font-medium text-sm">{item.warnaAtauDesain}</td>
                      <td className="p-5 text-right">
                        <div className="space-y-1">
                          <p className="text-white font-black text-sm">{item.totalYardOrder} <span className="text-blue-500 text-[10px]">YDS</span></p>
                          <p className="text-gray-500 font-bold text-[11px]">{item.totalMeterOrder} <span className="text-gray-600 text-[9px]">MTR</span></p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem]">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3"><FileText size={12}/> Internal Batch Notes</label>
            <p className="text-gray-300 text-sm italic leading-relaxed">
              {order.keterangan || "No specific instructions or notes provided for this production batch."}
            </p>
          </div>

        </div>
        
        {/* Footer Actions */}
        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end">
          <button 
            onClick={() => setIsOpen(false)}
            className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all group"
      >
        <Eye size={18} className="group-hover:scale-110 transition-transform"/>
      </button>
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}