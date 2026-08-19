"use client";

import React, { useState } from "react";
import { createFullOrder } from "@/server/inspector/orderdetail-actions";
import { 
  PlusCircle, 
  X, 
  Package,
  CheckCircle2, 
  UserCheck, 
  Image as ImageIcon, 
  Scissors, 
  Trash2, 
  Layers,
  Ruler
} from "lucide-react";

// ======================== HELPER FUNCTIONS UNTUK FORMAT TITIK ========================
// 1. Mengubah angka mentah menjadi format titik (contoh: 10000 -> "10.000")
const formatRibuan = (value: string | number) => {
  if (!value) return "";
  const nomorMentah = value.toString().replace(/\D/g, "");
  return nomorMentah.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// 2. Mengembalikan string ber-titik menjadi angka murni (contoh: "10.000" -> 10000)
const bersihAngka = (value: string | number) => {
  if (!value) return 0;
  return parseFloat(value.toString().replace(/\./g, "")) || 0;
};
// =====================================================================================

export default function CreateOrder({ master, onSuccess }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Header Info
  const [supplierId, setSupplierId] = useState("");
  const [qcAssignments, setQcAssignments] = useState({ qcUserId1: "", qcUserId2: "", qcUserId3: "" });
  const [keteranganHeader, setKeteranganHeader] = useState("");

  type FabricKategori = "polosan" | "printing";

  interface ItemForm {
    fabricTypeId: string;
    kategori: FabricKategori; 
    warnaAtauDesain: string;
    totalYardOrder: string;
    totalMeterOrder: string;
    imageUrl?: string;      
    isAnalyzing?: boolean;    
  }

  const [items, setItems] = useState<ItemForm[]>([
    { 
      fabricTypeId: "", 
      kategori: "polosan", 
      warnaAtauDesain: "", 
      totalYardOrder: "", 
      totalMeterOrder: "", 
      imageUrl: "" 
    }
  ]);

  // Fungsi Tambah Baris Kain
  const addNewItem = () => {
    setItems([...items, { fabricTypeId: "", kategori: "polosan", warnaAtauDesain: "", totalYardOrder: "", totalMeterOrder: "", imageUrl: "" }]);
  };

  // Fungsi Hapus Baris Kain 
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Update field item secara spesifik
  const updateItem = (index: number, field: keyof ItemForm, value: string | number | boolean) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Fungsi Khusus Menghandle Konversi Otomatis & Format Titik Yards
  const handleYardsChange = (index: number, val: string) => {
    const angkaMurniYards = bersihAngka(val);
    
    // Rumus Konversi: 1 Yard = 0.9144 Meter
    const angkaMurniMeter = angkaMurniYards * 0.9144;

    setItems(prev => prev.map((item, i) => 
      i === index ? { 
        ...item, 
        totalYardOrder: formatRibuan(val),
        totalMeterOrder: formatRibuan(Math.round(angkaMurniMeter).toString())
      } : item
    ));
  };

  // Fungsi Khusus Menghandle Konversi Otomatis & Format Titik Meters
  const handleMetersChange = (index: number, val: string) => {
    const angkaMurniMeter = bersihAngka(val);
    
    // Rumus Konversi: 1 Meter = 1.09361 Yards
    const angkaMurniYards = angkaMurniMeter * 1.09361;

    setItems(prev => prev.map((item, i) => 
      i === index ? { 
        ...item, 
        totalMeterOrder: formatRibuan(val),
        totalYardOrder: formatRibuan(Math.round(angkaMurniYards).toString())
      } : item
    ));
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 

    try {
      const cleanedItems = items.map(item => ({
        ...item,
        totalYardOrder: bersihAngka(item.totalYardOrder).toString(),
        totalMeterOrder: bersihAngka(item.totalMeterOrder).toString()
      }));

      const payload = {
        supplierId,
        ...qcAssignments,
        keteranganHeader,
        items: cleanedItems
      };

      const res = await createFullOrder(payload);
      if (res.success) {
        setIsOpen(false);
        resetForm();
        onSuccess();
      }
    } catch (error) {
      console.error("Gagal membuat order:", error);
    } finally {
      // Pastikan loading berhenti baik sukses maupun error!
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSupplierId("");
    setQcAssignments({ qcUserId1: "", qcUserId2: "", qcUserId3: "" });
    setKeteranganHeader("");
    setItems([{ fabricTypeId: "", kategori: "polosan", warnaAtauDesain: "", totalYardOrder: "", totalMeterOrder: "", imageUrl: "" }]);
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20">
      <PlusCircle size={20}/> Produksi Baru
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-6xl rounded-[3rem] my-auto shadow-2xl">
        
        {/* Header Modal */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02] rounded-t-[3rem]">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-blue-500">Buat Order Produksi</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">PT Dewa Sutratex II - Manajemen Logistik</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-red-500/20 hover:text-red-500 transition-all"><X/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          {/* SECTION 1: HEADER (SUPPLIER & QC) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Package size={14}/> 01. Asal & Supplier
              </label>
              <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 text-sm text-white" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                <option value="" className="bg-black text-gray-400">-- Pilih Supplier --</option>
                {master.suppliers.map((s:any) => <option key={s.id} value={s.id} className="bg-black text-white">{s.namaPerusahaan}</option>)}
              </select>
              <textarea className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 text-sm text-white placeholder-gray-500 h-24" placeholder="Catatan produksi (opsional)..." value={keteranganHeader} onChange={e => setKeteranganHeader(e.target.value)} />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <UserCheck size={14}/> 02. Penugasan Quality Control
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3].map((num) => (
                  <select key={num} className="w-full bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl outline-none focus:border-emerald-500 text-xs text-white" 
                    value={(qcAssignments as any)[`qcUserId${num}`]} 
                    onChange={e => setQcAssignments({...qcAssignments, [`qcUserId${num}`]: e.target.value})}>
                    <option value="" className="bg-black text-gray-400">-- Inspector {num} (Opsional) --</option>
                    
                    {/* HANYA TAMPILKAN USER DENGAN ROLE INSPECTOR */}
                    {master.inspectors
                      ?.filter((i: any) => i.role?.toLowerCase() === 'inspector')
                      .map((i: any) => (
                        <option key={i.id} value={i.id} className="bg-black text-white">
                          {i.username.toUpperCase()} - {i.divisi || 'QC'}
                        </option>
                    ))}

                  </select>
                ))}
              </div>
            </div>
          </div>
          
{/* SECTION 2: MULTI-ITEM FABRIC LIST */}
<div className="space-y-6">
  <div className="flex items-center justify-between border-b border-white/5 pb-4">
    <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
      <Layers size={14} /> 03. Item Kain & Spesifikasi
    </label>
    <button
      type="button"
      onClick={addNewItem}
      className="text-[10px] font-black bg-white/5 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 uppercase"
    >
      <PlusCircle size={14} /> Tambah Jenis Kain
    </button>
  </div>

  <div className="max-h-[450px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
    {items.map((item, index) => {
      // SINKRONISASI ID: Mencari data kain berdasarkan id yang dipilih user
      const fabricSpec = master.fabricTypes?.find((ft: any) => {
        if (!ft.id || !item.fabricTypeId) return false;
        return Number(ft.id) === Number(item.fabricTypeId);
      });

      return (
        <div
          key={index}
          className="bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 space-y-3 relative group"
        >
          {/* BARIS INPUT UTAMA (GRID 12) */}
          <div className="grid grid-cols-12 gap-3 items-center">
            
            {/* 1. Gambar & AI Scan (Makan 2 Kolom) */}
            <div className="col-span-2">
              <label className="cursor-pointer group/img relative flex flex-col items-center justify-center h-20 w-full bg-black border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/50 transition-all overflow-hidden">
                {item.imageUrl ? (
                  <>
                    <img src={item.imageUrl} alt="Fabric" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                    <div className="relative z-10 bg-black/60 px-2 py-1 rounded text-[8px] font-black text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                      GANTI
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
                      updateItem(index, 'isAnalyzing', true);

                      reader.onloadend = () => {
                        updateItem(index, 'imageUrl', reader.result as string);
                        setTimeout(() => updateItem(index, 'isAnalyzing', false), 1500);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {item.isAnalyzing && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-blue-500 animate-pulse rounded-full" />
                  <span className="text-[7px] font-black text-blue-500 italic uppercase">Memindai...</span>
                </div>
              )}
            </div>

            {/* 2. Jenis Kain (Makan 2 Kolom) */}
            <div className="col-span-2">
              <select
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-blue-500 text-white"
                value={item.fabricTypeId}
                onChange={(e) => updateItem(index, 'fabricTypeId', e.target.value)}
                required
              >
                <option value="" className="bg-black text-gray-500">-- Pilih Kain --</option>
                {master.fabricTypes.map((ft: any) => (
                  <option key={ft.id} value={ft.id} className="bg-black text-white">{ft.namaKain?.toUpperCase() || "NAMA KAIN"}</option>
                ))}
              </select>
            </div>

            {/* 3. Kategori Dropdown (Makan 1 Kolom) */}
            <div className="col-span-1">
              <select
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-[10px] font-bold outline-none text-white cursor-pointer text-center"
                value={item.kategori}
                onChange={(e) => updateItem(index, 'kategori', e.target.value as FabricKategori)}
              >
                <option value="polosan" className="bg-black text-white">POLOS</option>
                <option value="printing" className="bg-black text-white">PRINT</option>
              </select>
            </div>

            {/* 4. Input Warna / Desain (Makan 2 Kolom) */}
            <div className="col-span-2">
              <input
                className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-blue-500 text-white placeholder-gray-500"
                placeholder="Warna / Desain"
                value={item.warnaAtauDesain}
                onChange={(e) => updateItem(index, 'warnaAtauDesain', e.target.value)}
                required
              />
            </div>

            {/* 5. Yards (Makan 2 Kolom) */}
            <div className="col-span-2 relative">
              <input
                type="text" 
                className="w-full bg-black border border-white/10 p-4 pr-10 rounded-xl text-xs outline-none focus:border-amber-500 text-white placeholder-gray-500"
                placeholder="Yards"
                value={item.totalYardOrder}
                onChange={(e) => handleYardsChange(index, e.target.value)}
                required
              />
              <span className="absolute right-3 top-4 text-[8px] font-black text-slate-600 select-none">YDS</span>
            </div>

            {/* 6. Meters (Makan 2 Kolom) */}
            <div className="col-span-2 relative">
              <input
                type="text" 
                className="w-full bg-black border border-white/10 p-4 pr-10 rounded-xl text-xs outline-none focus:border-amber-500 text-white placeholder-gray-500"
                placeholder="Meter"
                value={item.totalMeterOrder}
                onChange={(e) => handleMetersChange(index, e.target.value)}
                required
              />
              <span className="absolute right-3 top-4 text-[8px] font-black text-slate-600 select-none">MTR</span>
            </div>

            {/* 7. Tombol Delete (Makan 1 Kolom) */}
            <div className="col-span-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-4 text-slate-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* BARIS INFO SPESIFIKASI TEKNIS LIVE (SUDAH DISINKRONKAN DENGAN POSTGRESQL) */}
          {fabricSpec ? (
            <div className="flex items-center gap-6 px-4 py-2 bg-blue-500/[0.03] border border-blue-500/10 rounded-xl text-[9px] font-mono tracking-wider text-slate-400">
              <span className="text-blue-400 font-bold uppercase">📊 STANDAR TEKNIS (ID: {fabricSpec.id}):</span>
              <div>TARGET LEBAR: <span className="text-white font-bold">{fabricSpec.targetLebar || "-"} CM</span> (TOL: ±{fabricSpec.toleransiLebar || "0"} CM)</div>
              <div className="w-px h-3 bg-white/10" />
              <div>TARGET GSM (K-T-K): <span className="text-white font-bold">{fabricSpec.targetGsmKiri || "0"}-{fabricSpec.targetGsmTengah || "0"}-{fabricSpec.targetGsmKanan || "0"}</span> (TOL: ±{fabricSpec.toleransiGsm || "0"})</div>
              <div className="w-px h-3 bg-white/10" />
              <div>MAKS BOWING: <span className="text-amber-500 font-bold">{fabricSpec.maxBowing || "0"}%</span></div>
              <div className="w-px h-3 bg-white/10" />
              <div>MAKS SKEWING: <span className="text-amber-500 font-bold">{fabricSpec.maxSkewing || "0"}%</span></div>
            </div>
          ) : (
            <div className="px-4 py-2 bg-white/[0.01] rounded-xl text-[9px] font-mono text-slate-600 italic">
              * Silakan tentukan Jenis Kain untuk memuat pegangan parameter standar kualitas PT Dewa Sutratex.
            </div>
          )}

        </div>
      );
    })}
  </div>
</div>
          {/* Submit Button */}
          <button 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all shadow-2xl shadow-blue-600/30 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
          >
            {loading ? "MENYIMPAN KE DATABASE..." : "PROSES ORDER PRODUKSI"}
          </button>
        </form>
      </div>
    </div>
  );
}