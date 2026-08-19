"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Eye, 
  X, 
  Calendar, 
  Building2, 
  FileText, 
  Box, 
  Layers,
  ImageIcon
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 isolate overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-6xl rounded-[2.5rem] shadow-2xl my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10 pointer-events-none" />
        
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter text-white">Production Batch</span>
            <span className="text-gray-400 font-mono text-sm font-bold">
              #{order?.id ? order.id.toString().padStart(4, '0') : '0000'}
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)} 
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all border border-white/10 cursor-pointer"
            title="Tutup Detail"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Grid Informasi Utama (Header) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Building2 size={12}/> Origin Entity
              </label>
              <p className="text-white font-bold text-base">{order?.supplier?.namaPerusahaan || order?.supplier?.nama || "N/A"}</p>
              <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-tight">PT Dewa Sutratex II Partner</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Calendar size={12}/> Created Timestamp
              </label>
              <p className="text-white font-bold text-base">
                {order?.tanggalOrder || order?.createdAt ? new Date(order.tanggalOrder || order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
              </p>
              <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-tight">
                Time: {order?.createdAt ? new Date(order.createdAt).toLocaleTimeString() : "N/A"}
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Box size={12}/> Assigned Inspectors
              </label>
              <div className="flex flex-wrap gap-2">
                {[order?.qcUser1, order?.qcUser2, order?.qcUser3].map((user, i) => user && (
                  <span key={i} className="bg-white/5 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-300 border border-white/5">
                    {user.username.toUpperCase()}
                  </span>
                ))}
                {!order?.qcUser1 && !order?.qcUser2 && !order?.qcUser3 && <span className="text-gray-600 text-xs italic">No inspectors assigned</span>}
              </div>
            </div>
          </div>

          {/* Tabel Daftar Produk / Item Detail */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
              <Layers size={14}/> 01. Itemized Fabric Specifications & Details
            </label>
            
            <div className="space-y-4">
              {order?.items?.map((item: any, idx: number) => {
                const fabricSpec = item.fabricType;

                return (
                  <div key={idx} className="bg-white/[0.02] p-5 rounded-[2rem] border border-white/5 space-y-4">
                    
                    {/* Baris Utama Item */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Preview Gambar Kain */}
                      <div className="md:col-span-2">
                        <div className="flex flex-col items-center justify-center h-20 w-full bg-black border border-white/10 rounded-2xl overflow-hidden relative">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="Fabric Spec" className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <ImageIcon size={18} className="text-slate-600" />
                              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">No Image</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Jenis Kain */}
                      <div className="md:col-span-3">
                        <p className="text-[8px] font-black text-slate-500 uppercase">Jenis Kain</p>
                        <p className="text-sm font-bold text-white uppercase">{fabricSpec?.namaKain || item.fabricType?.name || "Kain Standard"}</p>
                      </div>

                      {/* Kategori */}
                      <div className="md:col-span-2">
                        <p className="text-[8px] font-black text-slate-500 uppercase">Kategori</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.kategori === 'printing' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                          {item.kategori || "Polosan"}
                        </span>
                      </div>

                      {/* Warna / Desain */}
                      <div className="md:col-span-2">
                        <p className="text-[8px] font-black text-slate-500 uppercase">Warna / Desain</p>
                        <p className="text-xs font-bold text-gray-300 capitalize">{item.warnaAtauDesain || "-"}</p>
                      </div>

                      {/* Quantity Order */}
                      <div className="md:col-span-3 text-right">
                        <p className="text-[8px] font-black text-slate-500 uppercase">Quantity Order</p>
                        <p className="text-white font-black text-sm">{item.totalYardOrder} <span className="text-blue-500 text-[10px]">YDS</span></p>
                        <p className="text-gray-400 font-bold text-xs">{item.totalMeterOrder} <span className="text-gray-500 text-[9px]">MTR</span></p>
                      </div>

                    </div>

                    {/* Spesifikasi Teknis Standar Pabrik */}
                    {fabricSpec ? (
                      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-blue-500/[0.03] border border-blue-500/10 rounded-xl text-[9px] font-mono tracking-wider text-slate-400">
                        <span className="text-blue-400 font-bold uppercase">📊 TECHNICAL STANDARD:</span>
                        <div>TARGET WIDTH: <span className="text-white font-bold">{fabricSpec.targetWidth || "-"} CM</span></div>
                        <div className="w-px h-3 bg-white/10 hidden sm:block" />
                        <div>GSM: <span className="text-white font-bold">{fabricSpec.gsmLeft || "175"}-{fabricSpec.gsmCenter || "175"}-{fabricSpec.gsmRight || "175"}</span></div>
                        <div className="w-px h-3 bg-white/10 hidden sm:block" />
                        <div>BOWING: <span className="text-amber-500 font-bold">{fabricSpec.maxBowing || "2"}%</span></div>
                        <div className="w-px h-3 bg-white/10 hidden sm:block" />
                        <div>SKEWING: <span className="text-amber-500 font-bold">{fabricSpec.maxSkewing || "3"}%</span></div>
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-white/[0.01] rounded-xl text-[9px] font-mono text-slate-600 italic">
                        * Tidak ada spesifikasi teknis tambahan terlampir untuk item ini.
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem]">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3">
              <FileText size={12}/> Internal Batch Notes
            </label>
            <p className="text-gray-300 text-sm italic leading-relaxed">
              {order?.keterangan || "No specific instructions or notes provided for this production batch."}
            </p>
          </div>

        </div>
        
        {/* Footer Actions */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end sticky bottom-0 z-20 backdrop-blur-md">
          <button 
            onClick={() => setIsOpen(false)}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border border-white/10"
          >
            Close Detail
          </button>
        </div>

      </div>
    </div>
  );

  return (
    <>
      <span onClick={() => setIsOpen(true)}>
        {children || (
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all group cursor-pointer">
            <Eye size={18} className="group-hover:scale-110 transition-transform"/>
          </button>
        )}
      </span>
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}