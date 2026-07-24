"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateOrderAction } from "@/server/inspector/orderdetail-actions";
import { 
  Edit3, 
  X, 
  Save, 
  Box, 
  Trash2, 
  Package, 
  UserCheck,
  ImageIcon
} from "lucide-react";

interface Props {
  order: any;
  master: any;
  onSuccess: () => void;
}

// Tipe kategori kain
type FabricKategori = "polosan" | "printing";

interface ItemForm {
  fabricTypeId: string;
  kategori: FabricKategori;
  warnaAtauDesain: string;
  totalYardOrder: string;
  totalMeterOrder: string;
  imageUrl: string;
  isAnalyzing?: boolean; // State lokal simulasi loading scan per item
}

export default function EditOrder({ order, master, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. STATE UNTUK HEADER
  const [supplierId, setSupplierId] = useState(order.supplierId?.toString() || "");
  const [qcAssignments, setQcAssignments] = useState({
    qcUserId1: order.qcUserId1?.toString() || "",
    qcUserId2: order.qcUserId2?.toString() || "",
    qcUserId3: order.qcUserId3?.toString() || "",
  });
  const [keteranganHeader, setKeteranganHeader] = useState(order.keterangan || "");

  // 2. STATE UNTUK ITEMS (ARRAY)
  const [items, setItems] = useState<ItemForm[]>([]);

  // Inisialisasi data saat modal dibuka
  useEffect(() => {
    setMounted(true);
    if (isOpen && order.items) {
      const existingItems = order.items.map((item: any) => ({
        fabricTypeId: item.fabricTypeId?.toString() || "",
        kategori: item.kategori as FabricKategori,
        warnaAtauDesain: item.warnaAtauDesain || "",
        totalYardOrder: item.totalYardOrder?.toString() || "",
        totalMeterOrder: item.totalMeterOrder?.toString() || "",
        imageUrl: item.imageUrl || "",
        isAnalyzing: false
      }));
      setItems(existingItems);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, order]);

  // Fungsi Helper Update Item Field Singel
  const updateItemField = (index: number, field: keyof ItemForm, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addNewItem = () => {
    setItems([
      ...items, 
      { fabricTypeId: "", kategori: "polosan", warnaAtauDesain: "", totalYardOrder: "", totalMeterOrder: "", imageUrl: "", isAnalyzing: false }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      supplierId,
      ...qcAssignments,
      keteranganHeader,
      items: items // Link Image/Base64 akan diproses di Server Action yang barusan kita buat
    };

    try {
      const res = await updateOrderAction(order.id, payload);
      if (res.success) {
        setIsOpen(false);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate overflow-y-auto bg-black/90 backdrop-blur-xl">
      <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-6xl rounded-[3rem] shadow-2xl my-8过">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02] rounded-t-[3rem]">
          <h2 className="text-xl font-black uppercase italic text-white">
            Modify <span className="text-blue-500">Batch</span> ORD-{order.id.toString().padStart(4, '0')}
          </h2>
          <button type="button" onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-500/20 hover:text-red-500 transition-all"><X/></button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-10">
          
          {/* SECTION 1: HEADER INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Package size={12}/> Supplier Entity</label>
              <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white text-sm" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                {master.suppliers.map((s: any) => <option key={s.id} value={s.id} className="bg-black">{s.namaPerusahaan}</option>)}
              </select>
              <textarea className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white text-xs h-20" placeholder="Update notes..." value={keteranganHeader} onChange={e => setKeteranganHeader(e.target.value)} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2"><UserCheck size={12}/> QC Assignments</label>
              {[1, 2, 3].map((num) => (
                <select key={num} className="w-full bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl outline-none text-white text-xs" 
                  value={(qcAssignments as any)[`qcUserId${num}`]} 
                  onChange={e => setQcAssignments({...qcAssignments, [`qcUserId${num}`]: e.target.value})}>
                  <option value="" className="bg-black">-- No Inspector {num} --</option>
                  {master.inspectors.map((i: any) => (
                    <option key={i.id} value={i.id} className="bg-black">{i.username.toUpperCase()}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* SECTION 2: ITEMS LIST */}
<div className="space-y-4">
  <div className="flex items-center justify-between border-b border-white/5 pb-2">
    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><Box size={12}/> Production Items</label>
    <button type="button" onClick={addNewItem} className="text-[9px] font-black bg-blue-600/10 text-blue-500 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-all uppercase">+ Add Item</button>
  </div>

  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
    {items.map((item, idx) => {
      // Cari data spesifikasi kain dari objek 'order.items' asli berdasarkan fabricTypeId yang terpilih
      const originalItem = order.items?.find((o: any) => o.fabricTypeId?.toString() === item.fabricTypeId);
      const fabricSpec = originalItem?.fabricType;

      return (
        <div key={idx} className="bg-white/[0.02] p-5 rounded-[2rem] border border-white/5 space-y-3 relative group">
          
          {/* BARIS INPUT UTAMA (GRID 12) */}
          <div className="grid grid-cols-12 gap-3 items-center">
            
            {/* KOLOM 1: UPLOAD GAMBAR & PREVIEW */}
            <div className="col-span-2">
              <label className="cursor-pointer group/img relative flex flex-col items-center justify-center h-20 w-full bg-black border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/50 transition-all overflow-hidden">
                {item.imageUrl ? (
                  <>
                    <img src={item.imageUrl} alt="Fabric Spec" className="absolute inset-0 w-full h-full object-cover opacity-75" />
                    <div className="relative z-10 bg-black/70 px-2 py-1 rounded text-[8px] font-black text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                      REPLACE
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon size={18} className="text-slate-600 group-hover/img:text-blue-500 transition-colors" />
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">AI Scan</span>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      updateItemField(idx, 'isAnalyzing', true);

                      reader.onloadend = () => {
                        updateItemField(idx, 'imageUrl', reader.result as string);
                        setTimeout(() => updateItemField(idx, 'isAnalyzing', false), 1500);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {item.isAnalyzing && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-blue-500 animate-pulse rounded-full" />
                  <span className="text-[7px] font-black text-blue-500 italic uppercase">Scanning...</span>
                </div>
              )}
            </div>

            {/* KOLOM 2: JENIS KAIN */}
            <div className="col-span-2">
              <select className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-blue-500 text-white" value={item.fabricTypeId} onChange={e => updateItemField(idx, 'fabricTypeId', e.target.value)} required>
                <option value="" className="text-gray-500">-- Kain --</option>
                {master.fabricTypes.map((ft: any) => <option key={ft.id} value={ft.id} className="bg-black">{ft.namaKain?.toUpperCase()}</option>)}
              </select>
            </div>

            {/* KOLOM 3: KATEGORI DROPDOWN */}
            <div className="col-span-1">
              <select className="w-full bg-black border border-white/10 p-4 rounded-xl text-[10px] font-bold text-white outline-none text-center cursor-pointer" value={item.kategori} onChange={e => updateItemField(idx, 'kategori', e.target.value as FabricKategori)}>
                <option value="polosan" className="bg-black">POLOS</option>
                <option value="printing" className="bg-black">PRINT</option>
              </select>
            </div>

            {/* KOLOM 4: INPUT WARNA / DESAIN */}
            <div className="col-span-2">
              <input className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-blue-500" placeholder="Desain/Warna" value={item.warnaAtauDesain} onChange={e => updateItemField(idx, 'warnaAtauDesain', e.target.value)} required />
            </div>

            {/* KOLOM 5: INPUT YARDS */}
            <div className="col-span-2 relative">
              <input type="number" step="0.01" className="w-full bg-black border border-white/10 p-4 pr-10 rounded-xl text-xs text-white outline-none focus:border-amber-500" placeholder="Yds" value={item.totalYardOrder} onChange={e => updateItemField(idx, 'totalYardOrder', e.target.value)} required />
              <span className="absolute right-3 top-4 text-[8px] text-slate-600 font-black select-none">YDS</span>
            </div>

            {/* KOLOM 6: INPUT METERS */}
            <div className="col-span-2 relative">
              <input type="number" step="0.01" className="w-full bg-black border border-white/10 p-4 pr-10 rounded-xl text-xs text-white outline-none focus:border-amber-500" placeholder="Mtr" value={item.totalMeterOrder} onChange={e => updateItemField(idx, 'totalMeterOrder', e.target.value)} required />
              <span className="absolute right-3 top-4 text-[8px] text-slate-600 font-black select-none">MTR</span>
            </div>

            {/* KOLOM 7: TOMBOL HAPUS */}
            <div className="col-span-1 flex justify-end">
              <button type="button" onClick={() => removeItem(idx)} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </div>
          </div>

          {/* BARIS BARU MEMANJANG: SPESIFIKASI TEKNIS DARI FABRIC MASTER */}
          {fabricSpec ? (
            <div className="flex items-center gap-6 px-4 py-2 bg-blue-500/[0.03] border border-blue-500/10 rounded-xl text-[9px] font-mono tracking-wider text-slate-400">
              <span className="text-blue-400 font-bold uppercase">📊 TECHNICAL STANDARD:</span>
              <div>TARGET WIDTH: <span className="text-white font-bold">{fabricSpec.targetWidth || "-"} CM</span> (TOL: ±{fabricSpec.widthTolerance || "0"} CM)</div>
              <div className="w-px h-3 bg-white/10" />
              <div>GSM TARGET (L-C-R): <span className="text-white font-bold">{fabricSpec.gsmLeft || "175"}-{fabricSpec.gsmCenter || "175"}-{fabricSpec.gsmRight || "175"}</span> (TOL: ±{fabricSpec.weightTolerance || "5"})</div>
              <div className="w-px h-3 bg-white/10" />
              <div>MAX BOWING: <span className="text-amber-500 font-bold">{fabricSpec.maxBowing || "2"}%</span></div>
              <div className="w-px h-3 bg-white/10" />
              <div>MAX SKEWING: <span className="text-amber-500 font-bold">{fabricSpec.maxSkewing || "3"}%</span></div>
            </div>
          ) : (
            <div className="px-4 py-2 bg-white/[0.01] rounded-xl text-[9px] font-mono text-slate-600 italic">
              * Silakan pilih Jenis Kain untuk memuat parameter standar kualitas PT Dewa Sutratex.
            </div>
          )}

        </div>
      );
    })}
  </div>
</div>

          <button disabled={loading} className="w-full bg-blue-600 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-white disabled:bg-gray-800 disabled:shadow-none transition-all">
            <Save size={18}/> {loading ? "SYNCHRONIZING..." : "OVERWRITE PRODUCTION DATA"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-3 bg-white/5 hover:bg-blue-600/20 rounded-xl text-gray-400 hover:text-blue-500 transition-all shadow-sm"><Edit3 size={18}/></button>
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}