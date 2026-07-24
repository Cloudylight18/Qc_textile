"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, 
  XCircle, Camera, ListChecks, PlusCircle, Trash2, ImageIcon, Layers, Activity, FileText, Bot, Upload, Video, Image as ImageIcon2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createInitialInspection, getOrderItemDetail } from "@/server/inspector/inspector-actions"; 

export default function QCDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderItemId = Number(params.id);

  // --- STATE ---
  const [isOpenRef, setIsOpenRef] = useState(true); 
  const [isOpenAktual, setIsOpenAktual] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataRefState, setDataRefState] = useState<any>(null);
  
  const [input, setInput] = useState({
    noPiece: "",
    lebar: 0,
    panjangYard: 0,
    panjangMeter: 0,
    gsmKiri: 0,
    gsmTengah: 0,
    gsmKanan: 0,
    bowing: 0,
    skewing: 0,
    keterangan: "" 
  });

  const [defects, setDefects] = useState<any[]>([]);
  const [currentDefect, setCurrentDefect] = useState({
    nama: "",
    inci: 0,
    point: 0,
    yardKe: 0,
    namaSupplier: "" // TAMBAHAN: State untuk supplier
  });

  // --- CAMERA & AI STATE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [defectImage, setDefectImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State untuk Live Webcam (Laptop / HP)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- LOGIC 4-POINT SYSTEM & GRADING ---
  const calculatePoint = (inci: number) => {
    if (inci <= 0) return 0;
    if (inci <= 3) return 1;
    if (inci <= 6) return 2;
    if (inci <= 9) return 3;
    return 4;
  };

  const handleAddDefect = () => {
    if (!currentDefect.nama || currentDefect.inci === 0) {
      alert("⚠️ Isi nama defect dan dimensinya!");
      return;
    }
    
    // TAMBAHAN: Memasukkan data foto & supplier ke dalam array defects
    setDefects([...defects, { 
      ...currentDefect, 
      id: Date.now(),
      foto: defectImage // Menyimpan URL Base64 gambar agar terkirim ke DB
    }]);
    
    // Reset state setelah tambah
    setCurrentDefect({ nama: "", inci: 0, point: 0, yardKe: 0, namaSupplier: "" });
    setDefectImage(null);
  };

  const totalPoints = defects.reduce((acc, curr) => acc + curr.point, 0);
  
  const penaltyScore = input.panjangYard > 0 && input.lebar > 0 
    ? (totalPoints * 3600) / (input.lebar * input.panjangYard) 
    : 0;

  const getGrade = () => {
    if (penaltyScore === 0 && defects.length === 0) return { label: "-", value: "Reject", color: "bg-slate-200 text-slate-500" };
    if (penaltyScore <= 20) return { label: "GRADE A", value: "A", color: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" };
    if (penaltyScore <= 40) return { label: "GRADE B", value: "B", color: "bg-blue-600 text-white shadow-lg shadow-blue-500/30" };
    return { label: "GRADE C", value: "C", color: "bg-rose-600 text-white shadow-lg shadow-rose-500/30" };
  };

  // --- LOGIC AI SIMULATION ---
  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);
    
    // MOCKUP: Simulasi waktu loading AI (2.5 detik)
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const aiDetectedInches = 3.5; 
      setCurrentDefect(prev => ({
        ...prev,
        nama: "Hole / Bolong (Terdeteksi AI)",
        inci: aiDetectedInches,
        point: calculatePoint(aiDetectedInches)
      }));
      
    }, 2500);
  };

  // --- LOGIC UPLOAD FILE BIASA ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Menggunakan FileReader agar formatnya Base64 (Aman dikirim ke server)
        setDefectImage(reader.result as string);
        simulateAIAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIC LIVE WEBCAM (LAPTOP/HP) ---
  const startWebcam = async () => {
    setIsWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("⚠️ Gagal mengakses kamera. Pastikan browser memiliki izin (permission) untuk mengakses kamera.");
      setIsWebcamOpen(false);
      console.error(err);
    }
  };

  const captureWebcam = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
      
      setDefectImage(imageDataUrl);
      stopWebcam(); 
      simulateAIAnalysis();
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsWebcamOpen(false);
  };

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  // --- FETCH DATA REFERENSI KAIN ---
  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await getOrderItemDetail(orderItemId);
        if (data) {
          setDataRefState(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    }
    fetchDetail();
  }, [orderItemId]);

  const handleSaveReport = async () => {
    if (!input.noPiece || input.lebar === 0 || input.panjangYard === 0) {
      alert("⚠️ Lengkapi data utama No. Piece, Lebar, dan Yard Aktual!"); 
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderItemId: orderItemId,
        inspectorId: 6, 
        noPiece: input.noPiece,
        lebarAktual: input.lebar,  
        beratAktual: 0, 
        panjangYard: input.panjangYard,     
        panjangMeter: input.panjangMeter,    
        gsmKiri: input.gsmKiri,               
        gsmTengah: input.gsmTengah,          
        gsmKanan: input.gsmKanan,           
        bowing: input.bowing,
        skewing: input.skewing,
        keterangan: input.keterangan,         
        totalPoints: totalPoints, 
        pointsPer100Sqy: Number(penaltyScore.toFixed(2)), 
        grade: getGrade().value, 
        defects: defects // Defects di sini sudah memuat 'foto' & 'namaSupplier'
      } as any; 

      const result = await createInitialInspection(payload);

      if (result.success) {
        alert("✅ Data Inspeksi Berhasil Disimpan & Dikirim!");
        router.push(`/inspector/check/${orderItemId}`);
      }
    } catch (err) {
      alert("❌ Terjadi kesalahan koneksi database. Cek terminal/console untuk detailnya.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!dataRefState) {
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase text-slate-600 tracking-widest text-xs">
        Memuat Data Ref QC...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 px-2 md:px-0 font-sans antialiased">
      
      {/* PANEL HEADER FIXED RESPONSIVE */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md -mx-2 md:mx-0 md:rounded-b-2xl">
        <Link href={`/inspector/check/${orderItemId}`} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center flex-1 px-4 min-w-0">
          <h1 className="text-[9px] font-black uppercase tracking-widest text-blue-400">QC Inspection Panel</h1>
          <p className="text-xs font-black truncate uppercase text-slate-100">{dataRefState.namaKain || dataRefState.nama_kain || "NAMA KAIN"}</p>
        </div>
        <div className="w-9"></div>
      </div>

      <div className="p-2 md:p-4 max-w-2xl mx-auto space-y-4 mt-2">
        
        {/* SECTION 1: REFERENCE QUALITY DATA */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <button 
            type="button"
            onClick={() => setIsOpenRef(!isOpenRef)} 
            className="w-full p-4 flex justify-between items-center bg-slate-900 text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-xl text-slate-950 flex-shrink-0"><Layers size={14} /></div>
              <div className="text-left">
                <span className="font-black text-xs uppercase tracking-widest block text-amber-400">01. Standard Reference</span>
                <span className="text-[8px] font-medium text-slate-400 block tracking-tight">Acuan Standar Gudang Pusat</span>
              </div>
            </div>
            {isOpenRef ? <ChevronUp size={18} className="text-amber-400"/> : <ChevronDown size={18} className="text-amber-400"/>}
          </button>

          {isOpenRef && (
            <div className="p-4 md:p-6 space-y-4 bg-white border-t divide-y divide-slate-100">
              <div className="flex flex-row gap-4 items-center pb-2">
                <div className="w-20 h-20 bg-slate-950 rounded-xl border border-slate-200 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                  {dataRefState.imageUrl || dataRefState.image_url ? (
                    <img 
                      src={dataRefState.imageUrl || dataRefState.image_url} 
                      alt="Reference Spec" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-500">
                      <ImageIcon size={20} />
                      <span className="text-[7px] font-black uppercase tracking-widest mt-1">No Spec</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    {dataRefState.kategori?.toUpperCase() || "POLOSAN"}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase truncate">
                    {dataRefState.namaKain || dataRefState.nama_kain || "UNKNWN FABRIC"}
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <span className="text-[7px] block text-slate-400 font-bold uppercase">Desain</span>
                      <span className="text-[10px] font-black text-slate-700 truncate block">{dataRefState.warnaAtauDesain || dataRefState.warna_atau_desain || "-"}</span>
                    </div>
                    <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <span className="text-[7px] block text-slate-400 font-bold uppercase">Target Vol</span>
                      <span className="text-[10px] font-black text-blue-600 block">{dataRefState.totalYardOrder || dataRefState.total_yard_order || "0"} YDS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity size={10} className="text-blue-500" /> Target Lebar & Deviasi
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl">
                    <span className="text-[8px] font-black text-blue-600 uppercase block">Target Lebar</span>
                    <span className="text-base font-black text-slate-900">
                      {dataRefState.targetLebar || dataRefState.target_lebar || "-"} <span className="text-[10px] font-bold text-slate-400">CM</span>
                    </span>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl">
                    <span className="text-[8px] font-black text-emerald-600 uppercase block">Toleransi Lebar</span>
                    <span className="text-base font-black text-slate-900">
                      ± {dataRefState.toleransiLebar || dataRefState.toleransi_lebar || "0"} <span className="text-[10px] font-bold text-slate-400">CM</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider mb-1.5 text-center">Standar Matriks GSM Target</span>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <span className="text-[7px] block text-slate-400 font-bold">KIRI</span>
                      <span className="text-xs font-black text-slate-800">{dataRefState.targetGsmKiri || dataRefState.target_gsm_kiri || "175"}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                      <span className="text-[7px] block text-amber-400 font-black">MID</span>
                      <span className="text-xs font-black text-white">{dataRefState.targetGsmTengah || dataRefState.target_gsm_tengah || "175"}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                      <span className="text-[7px] block text-slate-400 font-bold">KANAN</span>
                      <span className="text-xs font-black text-slate-800">{dataRefState.targetGsmKanan || dataRefState.target_gsm_kanan || "175"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: INPUT DATA AKTUAL RESPONSIF */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <button onClick={() => setIsOpenAktual(!isOpenAktual)} className="w-full p-4 flex justify-between items-center bg-blue-50/20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white flex-shrink-0"><ListChecks size={14} /></div>
              <span className="font-black text-slate-800 text-xs uppercase tracking-widest">02. Input Data Aktual</span>
            </div>
            {isOpenAktual ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          </button>
          
          {isOpenAktual && (
            <div className="p-4 md:p-6 space-y-4 border-t border-blue-50">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">No. Piece</label>
                  <input type="text" placeholder="Contoh: PC-01" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500" onChange={(e) => setInput({...input, noPiece: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Lebar Aktual (Inci)</label>
                  <input type="number" placeholder="Inci" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500" onChange={(e) => setInput({...input, lebar: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-blue-600 uppercase ml-1">Panjang Yard Aktual</label>
                  <input type="number" placeholder="Yds" className="w-full bg-blue-50/50 border border-blue-200 p-3 rounded-xl font-black text-sm text-blue-700 outline-none" 
                    onChange={(e) => {
                      const yds = Number(e.target.value);
                      setInput({...input, panjangYard: yds, panjangMeter: Number((yds * 0.9144).toFixed(2))});
                    }} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Konversi Meter (Auto)</label>
                  <input type="number" value={input.panjangMeter} readOnly className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl font-black text-sm text-slate-500 outline-none" />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl space-y-2">
                <span className="text-[8px] font-black text-slate-500 uppercase block tracking-wider text-center">Pengukuran Gramasi Aktual (GSM)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[7px] text-center font-bold text-slate-400 block">GSM KIRI</label>
                    <input type="number" placeholder="0" className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 outline-none" onChange={(e) => setInput({...input, gsmKiri: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] text-center font-bold text-slate-400 block">GSM TENGAH</label>
                    <input type="number" placeholder="0" className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 outline-none" onChange={(e) => setInput({...input, gsmTengah: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] text-center font-bold text-slate-400 block">GSM KANAN</label>
                    <input type="number" placeholder="0" className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 outline-none" onChange={(e) => setInput({...input, gsmKanan: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col items-center gap-2 text-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Cacat Bowing</span>
                  <div className="flex items-center gap-3 w-full justify-center">
                    <button 
                      type="button" 
                      onClick={() => setInput({...input, bowing: 0})}
                      className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                        input.bowing === 0 ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      <CheckCircle2 size={12} /> OK
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setInput({...input, bowing: 1})}
                      className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                        input.bowing === 1 ? "bg-rose-600 text-white shadow-sm" : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      <XCircle size={12} /> Cacat
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col items-center gap-2 text-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Cacat Skewing</span>
                  <div className="flex items-center gap-3 w-full justify-center">
                    <button 
                      type="button" 
                      onClick={() => setInput({...input, skewing: 0})}
                      className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                        input.skewing === 0 ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      <CheckCircle2 size={12} /> OK
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setInput({...input, skewing: 1})}
                      className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                        input.skewing === 1 ? "bg-rose-600 text-white shadow-sm" : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      <XCircle size={12} /> Cacat
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 3: RECORDING DEFECTS PANEL & AI CAMERA */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="bg-orange-500 p-2 rounded-xl text-white flex-shrink-0"><Camera size={16}/></div>
            <h2 className="font-black text-slate-900 text-xs uppercase tracking-wider">03. Recording Defects (4-Point)</h2>
          </div>

          {/* AREA CAMERA & AI PREVIEW */}
          <div className="space-y-3">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            
            {/* JIKA WEBCAM SEDANG MENYALA */}
            {isWebcamOpen && !defectImage && (
              <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200">
                <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                
                <div className="absolute bottom-3 left-0 w-full flex justify-center gap-4 px-4">
                  <button type="button" onClick={stopWebcam} className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-rose-500 transition-colors">
                    BATAL
                  </button>
                  <button type="button" onClick={captureWebcam} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black tracking-widest shadow-lg shadow-indigo-600/30 flex items-center gap-2 hover:bg-indigo-500 transition-colors">
                    <Camera size={16} /> JEPRET FOTO
                  </button>
                </div>
              </div>
            )}

            {/* JIKA BELUM ADA GAMBAR DAN WEBCAM MATI */}
            {!defectImage && !isWebcamOpen && (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  onClick={startWebcam}
                  className="w-full bg-indigo-50 border border-indigo-200 text-indigo-600 p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                  <div className="bg-indigo-100 p-2 rounded-full"><Video size={18} className="text-indigo-600"/></div>
                  <span className="font-black uppercase text-[9px] tracking-widest text-center">Buka Kamera Langsung</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-600 p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <div className="bg-white p-2 rounded-full border border-slate-200"><Upload size={18} className="text-slate-500"/></div>
                  <span className="font-black uppercase text-[9px] tracking-widest text-center">Pilih File Galeri</span>
                </button>
              </div>
            )}

            {/* JIKA SUDAH ADA GAMBAR (HASIL FOTO ATAU UPLOAD) */}
            {defectImage && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <img src={defectImage} alt="Defect Captured" className="w-full h-full object-cover" />
                
                {isAnalyzing ? (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2">
                    <div className="w-8 h-8 border-4 border-t-indigo-500 border-white/20 rounded-full animate-spin"></div>
                    <span className="animate-pulse font-black uppercase text-[10px] tracking-widest text-indigo-300 flex items-center gap-1">
                      <Bot size={14}/> AI Sedang Menganalisis...
                    </span>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => {
                      setDefectImage(null);
                      setCurrentDefect({ ...currentDefect, nama: "", inci: 0, point: 0 }); // reset form defect tapi tahan supplier & yard
                    }}
                    className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg shadow-md hover:bg-rose-600 transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <input 
              type="text" 
              placeholder="Nama Defect (Hole, Kotor, Slub, Garis Lusi)" 
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500"
              value={currentDefect.nama}
              onChange={(e) => setCurrentDefect({...currentDefect, nama: e.target.value})}
              disabled={isAnalyzing}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-blue-600 uppercase ml-1">Panjang Defect (Inci)</label>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  className="w-full bg-blue-50/40 border border-blue-200 p-3.5 rounded-xl font-black text-sm text-blue-700 outline-none"
                  value={currentDefect.inci || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCurrentDefect({...currentDefect, inci: val, point: calculatePoint(val)});
                  }}
                  disabled={isAnalyzing}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Bobot Poin (Otomatis)</label>
                <div className={`p-3 rounded-xl font-black text-center text-lg shadow-inner transition-colors h-[48px] flex items-center justify-center ${currentDefect.point > 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                  {currentDefect.point} Pt
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Posisi (Yard Ke-)</label>
                <input 
                  type="number" 
                  placeholder="Ex: 42.5" 
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500"
                  value={currentDefect.yardKe || ""}
                  onChange={(e) => setCurrentDefect({...currentDefect, yardKe: Number(e.target.value)})}
                  disabled={isAnalyzing}
                />
              </div>
              {/* TAMBAHAN INPUT SUPPLIER */}
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Nama Supplier (Opsional)</label>
                <input 
                  type="text" 
                  placeholder="Ex: PT. ABC" 
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500"
                  value={currentDefect.namaSupplier}
                  onChange={(e) => setCurrentDefect({...currentDefect, namaSupplier: e.target.value})}
                  disabled={isAnalyzing}
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleAddDefect} 
              disabled={isAnalyzing}
              className="w-full bg-slate-900 text-white p-3.5 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <PlusCircle size={14} /> Tambah Defect Ke Register
            </button>
          </div>

          {/* REGISTERED TEMUAN LIST */}
          {defects.length > 0 && (
            <div className="space-y-1.5 mt-3 border-t border-slate-100 pt-3">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Daftar Manifest Kerusakan:</p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {defects.map((d) => (
                  <div key={d.id} className="flex justify-between items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {/* Tampilkan indikator foto jika dilampirkan foto */}
                      {d.foto ? <ImageIcon2 size={12} className="text-blue-500 flex-shrink-0" /> : null}
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate">
                        {d.nama} 
                        {d.namaSupplier && <span className="text-[9px] font-medium text-slate-400 ml-1">({d.namaSupplier})</span>}
                        <span className="text-slate-300 mx-1">|</span> 
                        {d.inci}" <span className="text-orange-600 font-black">({d.point} Pts)</span> 
                        <span className="text-slate-400 text-[9px] font-normal lowercase ml-1">at yd {d.yardKe}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setDefects(defects.filter(x => x.id !== d.id))} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg flex-shrink-0"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: KETERANGAN AKHIR */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 p-4 md:p-6 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-slate-400" />
            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-wider">04. Keterangan Tambahan</h3>
          </div>
          <textarea 
            placeholder="Ketik catatan opsional jika ada keanehan pada benang atau lusi kain..." 
            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium text-sm text-slate-900 outline-none focus:border-blue-500 h-20 resize-none"
            onChange={(e) => setInput({...input, keterangan: e.target.value})}
          ></textarea>
        </div>

        {/* SECTION 5: LIVE PENALTY & GRADING CALCULATOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-md flex flex-row items-center justify-between text-white">
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Penalty Score (Pts/100Y)</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{penaltyScore.toFixed(2)}</p>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Points</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`${getGrade().color} px-5 md:px-7 py-2.5 rounded-xl font-black italic text-sm md:text-base tracking-tighter transform -rotate-1 inline-block`}>
              {getGrade().label}
            </div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-widest block">Kalkulasi Sistem</p>
          </div>
        </div>

        {/* SUBMIT FORM BUTTON */}
        <button 
          onClick={handleSaveReport}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 md:p-5 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500"
        >
          {loading ? "⏳ MENGIRIM DATA..." : "SIMPAN & KIRIM DATA KE PIMPINAN"}
        </button>

      </div>
    </div>
  );
}