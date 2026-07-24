// "use client";

// import { useState, useEffect } from "react";
// import { 
//   ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, 
//   XCircle, Camera, ListChecks, PlusCircle, Trash2, ImageIcon, Layers, Activity, FileText
// } from "lucide-react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// // Memanggil fungsi dari backend (TIDAK BOLEH menulis logika DB langsung di file ini)
// import { updateInspectionRecord, getInspectionDetail, getOrderItemDetail } from "@/server/orderdetail-actions"; 

// export default function EditQCDetailPage() {
//   const params = useParams();
//   const router = useRouter();
  
//   // Mengambil ID dari URL
//   const orderItemId = Number(params.id);
//   // Jika URL Anda adalah /edit/5, maka inspId akan menangkap angka 5
//   // Jika folder Anda belum menggunakan [inspId], ini akan menjadi NaN (Not a Number)
//   const inspectionId = Number(params.inspId); 

//   // --- STATE ---
//   const [isOpenRef, setIsOpenRef] = useState(false); 
//   const [isOpenAktual, setIsOpenAktual] = useState(true);
//   const [loadingInitial, setLoadingInitial] = useState(true); 
//   const [loadingSubmit, setLoadingSubmit] = useState(false); 
//   const [dataRefState, setDataRefState] = useState<any>(null);
  
//   const [input, setInput] = useState({
//     noPiece: "",
//     lebar: 0,
//     panjangYard: 0,
//     panjangMeter: 0,
//     gsmKiri: 0,
//     gsmTengah: 0,
//     gsmKanan: 0,
//     bowing: 0,
//     skewing: 0,
//     keterangan: "" 
//   });

//   const [defects, setDefects] = useState<any[]>([]);
//   const [currentDefect, setCurrentDefect] = useState({
//     nama: "",
//     inci: 0,
//     point: 0,
//     yardKe: 0
//   });

//   // --- LOGIC 4-POINT SYSTEM & GRADING ---
//   const calculatePoint = (inci: number) => {
//     if (inci <= 0) return 0;
//     if (inci <= 3) return 1;
//     if (inci <= 6) return 2;
//     if (inci <= 9) return 3;
//     return 4;
//   };

//   const handleAddDefect = () => {
//     if (!currentDefect.nama || currentDefect.inci === 0) {
//       alert("⚠️ Isi nama defect dan dimensinya!");
//       return;
//     }
//     setDefects([...defects, { ...currentDefect, id: Date.now() }]);
//     setCurrentDefect({ nama: "", inci: 0, point: 0, yardKe: 0 });
//   };

//   const totalPoints = defects.reduce((acc, curr) => acc + curr.point, 0);
  
//   const penaltyScore = input.panjangYard > 0 && input.lebar > 0 
//     ? (totalPoints * 3600) / (input.lebar * input.panjangYard) 
//     : 0;

//   const getGrade = () => {
//     if (penaltyScore === 0 && defects.length === 0) return { label: "-", value: "Reject", color: "bg-slate-200 text-slate-500" };
//     if (penaltyScore <= 20) return { label: "GRADE A", value: "A", color: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" };
//     if (penaltyScore <= 40) return { label: "GRADE B", value: "B", color: "bg-blue-600 text-white shadow-lg shadow-blue-500/30" };
//     return { label: "GRADE C", value: "C", color: "bg-rose-600 text-white shadow-lg shadow-rose-500/30" };
//   };

//   // --- FETCH DATA LAMA DARI DATABASE ---
//   useEffect(() => {
//     async function fetchAllData() {
//       try {
//         setLoadingInitial(true);
        
//         // Cek jika inspectionId valid (bukan NaN)
//         if (!inspectionId) {
//           console.warn("inspectionId tidak ditemukan di URL. Pastikan struktur folder menggunakan [inspId]");
//         }

//         const [kainData, inspData] = await Promise.all([
//           getOrderItemDetail(orderItemId),
//           inspectionId ? getInspectionDetail(inspectionId) : Promise.resolve(null)
//         ]);

//         if (kainData) setDataRefState(kainData);

//         if (inspData) {
//           setInput({
//             noPiece: inspData.nomorPiece || inspData.nomor_piece || "",
//             lebar: inspData.lebarAktual || inspData.lebar_aktual || 0,
//             panjangYard: inspData.panjangYardAktual || inspData.panjang_yard_aktual || 0,
//             panjangMeter: inspData.panjangMeterAktual || inspData.panjang_meter_aktual || 0,
//             gsmKiri: inspData.gsmKiriAktual || inspData.gsm_kiri_aktual || 0,
//             gsmTengah: inspData.gsmTengahAktual || inspData.gsm_tengah_aktual || 0,
//             gsmKanan: inspData.gsmKananAktual || inspData.gsm_kanan_aktual || 0,
//             bowing: inspData.bowingAktual || inspData.bowing_aktual || 0,
//             skewing: inspData.skewingAktual || inspData.skewing_aktual || 0,
//             keterangan: inspData.catatanInspector || inspData.catatan_inspector || ""
//           });
//         }
//       } catch (error) {
//         console.error("Gagal memuat data:", error);
//       } finally {
//         setLoadingInitial(false);
//       }
//     }
    
//     if (orderItemId) {
//       fetchAllData();
//     }
//   }, [orderItemId, inspectionId]);

//   // --- SUBMIT UPDATE DATA ---
//   const handleUpdateReport = async () => {
//     if (!input.noPiece || input.lebar === 0 || input.panjangYard === 0) {
//       alert("⚠️ Lengkapi data utama No. Piece, Lebar, dan Yard Aktual!"); 
//       return;
//     }

//     if (!inspectionId) {
//       alert("⚠️ ID Inspeksi tidak ditemukan di URL. Gagal mengupdate data.");
//       return;
//     }

//     setLoadingSubmit(true);
//     try {
//       const payload = {
//         nomorPiece: input.noPiece,
//         lebarAktual: input.lebar,  
//         panjangYardAktual: input.panjangYard, 
//         panjangMeterAktual: input.panjangMeter, 
//         gsmKiriAktual: input.gsmKiri, 
//         gsmTengahAktual: input.gsmTengah, 
//         gsmKananAktual: input.gsmKanan, 
//         bowingAktual: input.bowing,
//         skewingAktual: input.skewing,
//         catatanInspector: input.keterangan,
//         totalPoints: totalPoints, 
//         pointsPer100Sqy: Number(penaltyScore.toFixed(2)), 
//         grade: getGrade().value,
//         defects: defects 
//       } as any; 

//       const result = await updateInspectionRecord(inspectionId, payload);

//       if (result.success) {
//         alert("✅ Data Inspeksi Berhasil Diperbarui!");
//         router.push(`/inspector/check/${orderItemId}`);
//       }
//     } catch (err) {
//       alert("❌ Terjadi kesalahan saat update database.");
//       console.error(err);
//     } finally {
//       setLoadingSubmit(false);
//     }
//   };

//   if (loadingInitial) {
//     return (
//       <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-slate-500">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
//         <p className="text-xs font-black uppercase tracking-widest animate-pulse">Menarik Data Lama...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f8fafc] pb-32 px-2 md:px-0 font-sans antialiased">
//       <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md -mx-2 md:mx-0 md:rounded-b-2xl">
//         <Link href={`/inspector/check/${orderItemId}`} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
//           <ArrowLeft size={20} />
//         </Link>
//         <div className="text-center flex-1 px-4 min-w-0">
//           <h1 className="text-[9px] font-black uppercase tracking-widest text-yellow-400">EDIT QC Inspection</h1>
//           <p className="text-xs font-black truncate uppercase text-slate-100">{dataRefState?.namaKain || dataRefState?.nama_kain || "NAMA KAIN"}</p>
//         </div>
//         <div className="w-9"></div>
//       </div>

//       <div className="p-2 md:p-4 max-w-2xl mx-auto space-y-4 mt-2">
//         {/* REFERENSI KAIN */}
//         <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
//           <button type="button" onClick={() => setIsOpenRef(!isOpenRef)} className="w-full p-4 flex justify-between items-center bg-slate-900 text-white transition-all">
//             <div className="flex items-center gap-3">
//               <div className="bg-amber-500 p-2 rounded-xl text-slate-950 flex-shrink-0"><Layers size={14} /></div>
//               <span className="font-black text-xs uppercase tracking-widest text-amber-400">01. Standard Reference</span>
//             </div>
//             {isOpenRef ? <ChevronUp size={18} className="text-amber-400"/> : <ChevronDown size={18} className="text-amber-400"/>}
//           </button>
//           {isOpenRef && (
//             <div className="p-4 md:p-6 text-center text-xs text-slate-500 italic border-t">
//               Detail kain disembunyikan. Fokus pada form edit di bawah.
//             </div>
//           )}
//         </div>

//         {/* INPUT DATA AKTUAL */}
//         <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-yellow-300 overflow-hidden ring-4 ring-yellow-500/10">
//           <button onClick={() => setIsOpenAktual(!isOpenAktual)} className="w-full p-4 flex justify-between items-center bg-yellow-50">
//             <div className="flex items-center gap-3">
//               <div className="bg-yellow-500 p-2 rounded-xl text-white flex-shrink-0"><ListChecks size={14} /></div>
//               <span className="font-black text-yellow-800 text-xs uppercase tracking-widest">02. Edit Data Aktual</span>
//             </div>
//             {isOpenAktual ? <ChevronUp size={18} className="text-yellow-600"/> : <ChevronDown size={18} className="text-yellow-600"/>}
//           </button>
          
//           {isOpenAktual && (
//             <div className="p-4 md:p-6 space-y-4 border-t border-yellow-100">
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-[8px] font-black text-slate-400 uppercase ml-1">No. Piece</label>
//                   <input type="text" value={input.noPiece} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-yellow-500" onChange={(e) => setInput({...input, noPiece: e.target.value})} />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Lebar Aktual (Inci)</label>
//                   <input type="number" value={input.lebar || ""} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-yellow-500" onChange={(e) => setInput({...input, lebar: Number(e.target.value)})} />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <label className="text-[8px] font-black text-blue-600 uppercase ml-1">Panjang Yard Aktual</label>
//                   <input type="number" value={input.panjangYard || ""} className="w-full bg-blue-50/50 border border-blue-200 p-3 rounded-xl font-black text-sm text-blue-700 outline-none" 
//                     onChange={(e) => {
//                       const yds = Number(e.target.value);
//                       setInput({...input, panjangYard: yds, panjangMeter: Number((yds * 0.9144).toFixed(2))});
//                     }} 
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Konversi Meter</label>
//                   <input type="number" value={input.panjangMeter || 0} readOnly className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl font-black text-sm text-slate-500 outline-none" />
//                 </div>
//               </div>

//               <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl space-y-2">
//                 <span className="text-[8px] font-black text-slate-500 uppercase block tracking-wider text-center">Pengukuran Gramasi Aktual (GSM)</span>
//                 <div className="grid grid-cols-3 gap-2">
//                   <div className="space-y-1">
//                     <label className="text-[7px] text-center font-bold text-slate-400 block">KIRI</label>
//                     <input type="number" value={input.gsmKiri || ""} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 outline-none" onChange={(e) => setInput({...input, gsmKiri: Number(e.target.value)})} />
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-[7px] text-center font-bold text-slate-400 block">TENGAH</label>
//                     <input type="number" value={input.gsmTengah || ""} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 outline-none" onChange={(e) => setInput({...input, gsmTengah: Number(e.target.value)})} />
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-[7px] text-center font-bold text-slate-400 block">KANAN</label>
//                     <input type="number" value={input.gsmKanan || ""} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 outline-none" onChange={(e) => setInput({...input, gsmKanan: Number(e.target.value)})} />
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3 pt-1">
//                 <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col items-center gap-2 text-center">
//                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Cacat Bowing</span>
//                   <div className="flex items-center gap-3 w-full justify-center">
//                     <button type="button" onClick={() => setInput({...input, bowing: 0})} className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${input.bowing === 0 ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-400 border border-slate-200"}`}>
//                       <CheckCircle2 size={12} /> OK
//                     </button>
//                     <button type="button" onClick={() => setInput({...input, bowing: 1})} className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${input.bowing === 1 ? "bg-rose-600 text-white shadow-sm" : "bg-white text-slate-400 border border-slate-200"}`}>
//                       <XCircle size={12} /> Cacat
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col items-center gap-2 text-center">
//                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Cacat Skewing</span>
//                   <div className="flex items-center gap-3 w-full justify-center">
//                     <button type="button" onClick={() => setInput({...input, skewing: 0})} className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${input.skewing === 0 ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-400 border border-slate-200"}`}>
//                       <CheckCircle2 size={12} /> OK
//                     </button>
//                     <button type="button" onClick={() => setInput({...input, skewing: 1})} className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${input.skewing === 1 ? "bg-rose-600 text-white shadow-sm" : "bg-white text-slate-400 border border-slate-200"}`}>
//                       <XCircle size={12} /> Cacat
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* KETERANGAN AKHIR */}
//         <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 p-4 md:p-6 space-y-2">
//           <div className="flex items-center gap-2 mb-1">
//             <FileText size={14} className="text-slate-400" />
//             <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-wider">04. Keterangan Tambahan</h3>
//           </div>
//           <textarea 
//             value={input.keterangan || ""}
//             placeholder="Ketik catatan opsional..." 
//             className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium text-sm text-slate-900 outline-none focus:border-yellow-500 h-20 resize-none"
//             onChange={(e) => setInput({...input, keterangan: e.target.value})}
//           ></textarea>
//         </div>

//         {/* SCORE & TOMBOL SIMPAN */}
//         <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-md flex flex-row items-center justify-between text-white">
//           <div className="space-y-0.5">
//             <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Penalty Score (Pts/100Y)</p>
//             <div className="flex items-baseline gap-1">
//               <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{penaltyScore.toFixed(2)}</p>
//               <span className="text-[8px] font-bold text-slate-400 uppercase">Points</span>
//             </div>
//           </div>
//           <div className="text-right">
//             <div className={`${getGrade().color} px-5 md:px-7 py-2.5 rounded-xl font-black italic text-sm md:text-base tracking-tighter transform -rotate-1 inline-block`}>
//               {getGrade().label}
//             </div>
//           </div>
//         </div>

//         <button 
//           onClick={handleUpdateReport}
//           disabled={loadingSubmit}
//           className="w-full bg-yellow-500 text-yellow-950 p-4 md:p-5 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all hover:bg-yellow-400 active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500"
//         >
//           {loadingSubmit ? "⏳ MENYIMPAN PERUBAHAN..." : "UPDATE & SIMPAN PERUBAHAN"}
//         </button>

//       </div>
//     </div>
//   );
// }