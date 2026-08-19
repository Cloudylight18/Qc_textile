"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getInspectionForEdit, updateInspectionRecord } from "@/server/inspector/inspector-actions"; 

interface InspectionInput {
  noPiece: string;
  lebar: number;
  panjangYard: number;
  panjangMeter: number;
  keterangan: string;
}

interface Defect {
  id: number; 
  nama: string; 
  inci: number; 
  point: number; 
  yardKe: number; 
  foto: string | null;
}

interface RawDefect {
  id: number;
  jenisDefect: string;
  ukuranInci: number;
  poin: number;
  posisiYard: number;
  fotoDefectUrl: string | null;
}

export default function EditInspectionPage() {
  const params = useParams();
  const router = useRouter();

  // Menangkap parameter dinamis URL secara aman berdasarkan struktur folder Next.js ([orderItemId] & [inspectionId])
  const orderItemId = Number(params.orderItemId);
  const inspectionId = Number(params.inspectionId); 

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [input, setInput] = useState<InspectionInput>({
    noPiece: "", lebar: 0, panjangYard: 0, panjangMeter: 0, keterangan: "" 
  });
  
  const [defects, setDefects] = useState<Defect[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!inspectionId || isNaN(inspectionId)) {
        console.error("ID Inspeksi tidak valid");
        setLoading(false);
        return;
      }

      try {
         const data = await getInspectionForEdit(inspectionId); 
         if (data) {
            setInput({
               noPiece: data.nomorPiece || "",
               lebar: data.lebarAktual || 0,
               panjangYard: data.panjangYardAktual || 0,
               panjangMeter: data.panjangMeterAktual || 0,
               keterangan: data.catatanInspector || ""
            });
            
            if (data.defects && Array.isArray(data.defects)) {
              setDefects(data.defects.map((d: RawDefect) => ({
                 id: d.id, 
                 nama: d.jenisDefect, 
                 inci: d.ukuranInci, 
                 point: d.poin, 
                 yardKe: d.posisiYard, 
                 foto: d.fotoDefectUrl || null
              })));
            }
         }
      } catch (err) {
         console.error("Gagal mengambil data inspeksi:", err);
      } finally {
         setLoading(false);
      }
    }
    fetchData();
  }, [inspectionId]);

  const handleUpdate = async () => {
    if (!input.noPiece || input.lebar === 0 || input.panjangYard === 0) {
      alert("⚠️ Lengkapi data utama No. Piece, Lebar, dan Yard Aktual!"); 
      return;
    }

    if (!inspectionId || isNaN(inspectionId)) {
      alert("⚠️ ID Inspeksi tidak valid!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nomorPiece: input.noPiece,
        lebarAktual: Number(input.lebar),
        panjangYardAktual: Number(input.panjangYard),
        panjangMeterAktual: Number(input.panjangMeter),
        catatanInspector: input.keterangan,
      };

      const res = await updateInspectionRecord(inspectionId, payload);
      
      if (res && res.success) {
        alert("Data inspeksi berhasil diperbarui!");
        // Kembali ke halaman check order item yang sesuai
        const targetUrl = !isNaN(orderItemId) ? `/inspector/check/${orderItemId}` : "/inspector/tugas";
        router.push(targetUrl);
      } else {
        alert(res?.message || "Gagal memperbarui data.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat memperbarui data.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50 dark:bg-slate-950">
        Memuat Data Roll...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 px-2 md:px-0 font-sans">
       {/* HEADER */}
       <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center shadow-md -mx-2 md:mx-0 md:rounded-b-2xl">
          <Link 
            href={!isNaN(orderItemId) ? `/inspector/check/${orderItemId}` : "/inspector/tugas"} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="text-center flex-1 px-4">
             <h1 className="text-[9px] font-black uppercase text-amber-400 tracking-widest">Mode Edit (Koreksi)</h1>
             <p className="text-xs font-black truncate uppercase text-slate-100">Roll: {input.noPiece || "..."}</p>
          </div>
       </div>

       {/* FORM KOREKSI */}
       <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Koreksi Data Aktual
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase">No. Piece</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                  value={input.noPiece} 
                  onChange={(e) => setInput({...input, noPiece: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase">Lebar Aktual (Inci)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                  value={input.lebar} 
                  onChange={(e) => setInput({...input, lebar: Number(e.target.value)})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase">Panjang Yard Aktual</label>
                <input 
                  type="number" 
                  className="w-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 p-3 rounded-xl font-black text-sm text-blue-700 dark:text-blue-300 outline-none focus:border-blue-500" 
                  value={input.panjangYard} 
                  onChange={(e) => { 
                    const y = Number(e.target.value); 
                    setInput({...input, panjangYard: y, panjangMeter: Number((y * 0.9144).toFixed(2))}) 
                  }} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase">Konversi Meter</label>
                <input 
                  type="number" 
                  value={input.panjangMeter} 
                  readOnly 
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-black text-sm text-slate-500 cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="space-y-1 pt-3">
              <label className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase">Keterangan Tambahan / History Timer</label>
              <textarea 
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-medium text-sm text-slate-900 dark:text-white h-32 outline-none focus:border-blue-500 resize-y" 
                value={input.keterangan} 
                onChange={(e) => setInput({...input, keterangan: e.target.value})}
              ></textarea>
            </div>
          </div>

          <p className="text-[10px] text-slate-600 dark:text-amber-300 font-bold uppercase tracking-widest text-center mt-6 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
            ⚠️ Daftar Defect tidak bisa diedit via panel ini secara langsung. Jika ingin merubah detail defect, silakan lakukan di halaman Dashboard Defect atau hapus roll ini dan buat inspeksi baru.
          </p>

          <button 
            onClick={handleUpdate} 
            disabled={isSaving} 
            className="w-full bg-amber-500 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 mt-8 disabled:opacity-50"
          >
             {isSaving ? "MENYIMPAN PERUBAHAN..." : <><Save size={16}/> SIMPAN PERUBAHAN DATA INSPEKSI</>}
          </button>
       </div>
    </div>
  );
}