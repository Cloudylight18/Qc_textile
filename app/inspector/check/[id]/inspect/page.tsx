"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, 
  XCircle, Camera, ListChecks, PlusCircle, Trash2, 
  Layers, Activity, FileText, Upload, Video, Image as ImageIcon2, StopCircle, Clock, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createInitialInspection, getOrderItemDetail } from "@/server/inspector/inspector-actions"; 

export default function QCDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const rawId = params.id as string;
  const orderItemId = rawId ? (isNaN(Number(rawId)) ? parseInt(rawId, 16) || 0 : Number(rawId)) : 0;

  // --- STOPWATCH TIMER STATE ---
  const [qcTimer, setQcTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setQcTimer(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // --- STATE DATA ---
  const [isOpenRef, setIsOpenRef] = useState(true); 
  const [isOpenAktual, setIsOpenAktual] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dataRefState, setDataRefState] = useState<any>(null);
  const [currentInspectorId, setCurrentInspectorId] = useState<number | null>(null);
  
  const [input, setInput] = useState({
    noPiece: "", lebar: 0, panjangYard: 0, panjangMeter: 0,
    gsmKiri: 0, gsmTengah: 0, gsmKanan: 0,
    bowing: 0, skewing: 0, keterangan: "" 
  });

  const [defects, setDefects] = useState<any[]>([]);
  // DITAMBAHKAN: State untuk isBadSpot dan isMajorDefect
  const [currentDefect, setCurrentDefect] = useState({
    nama: "", inci: 0, point: 0, yardKe: 0, isBadSpot: false, isMajorDefect: false
  });

  // --- CAMERA, VIDEO & MEDIA STATE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [defectMedia, setDefectMedia] = useState<{url: string, type: 'image'|'video'} | null>(null);
  const [cameraMode, setCameraMode] = useState<'photo'|'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // DITAMBAHKAN: Parameter isBS dan isMajor untuk overide poin
  const calculatePoint = (inci: number, isBS: boolean = false, isMajor: boolean = false) => {
    if (isBS || isMajor) return 4;
    if (inci <= 0) return 0;
    if (inci <= 3) return 1;
    if (inci <= 6) return 2;
    if (inci <= 9) return 3;
    return 4;
  };

  const handleAddDefect = () => {
    // DITAMBAHKAN: Pengecualian validasi dimensi jika ditandai sebagai cacat khusus
    if (!currentDefect.nama || (!currentDefect.isBadSpot && !currentDefect.isMajorDefect && currentDefect.inci === 0)) {
      alert("⚠️ Isi nama defect dan dimensinya!");
      return;
    }
    setDefects([...defects, { ...currentDefect, id: Date.now(), foto: defectMedia?.url || null }]);
    setCurrentDefect({ nama: "", inci: 0, point: 0, yardKe: 0, isBadSpot: false, isMajorDefect: false });
    setDefectMedia(null);
  };

  const totalPoints = defects.reduce((acc, curr) => acc + curr.point, 0);
  const bsCount = defects.filter(d => d.isBadSpot).length; // Hitung jumlah Bad Spot
  const penaltyScore = input.panjangYard > 0 && input.lebar > 0 ? (totalPoints * 3600) / (input.lebar * input.panjangYard) : 0;
  
  const getGrade = () => {
    // DITAMBAHKAN: Aturan Auto-Reject jika Bad Spot melebihi 4
    if (bsCount > 4) return { label: "REJECT (MAX BS)", value: "Reject", color: "bg-rose-700 text-white shadow-lg shadow-rose-600/50" };
    if (penaltyScore === 0 && defects.length === 0) return { label: "-", value: "Reject", color: "bg-slate-200 text-slate-500" };
    if (penaltyScore <= 20) return { label: "GRADE A", value: "A", color: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" };
    if (penaltyScore <= 40) return { label: "GRADE B", value: "B", color: "bg-blue-600 text-white shadow-lg shadow-blue-500/30" };
    return { label: "GRADE C", value: "C", color: "bg-rose-600 text-white shadow-lg shadow-rose-500/30" };
  };

  // --- LOGIC UPLOAD & WEBCAM ---
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { alert("⚠️ File terlalu besar! Maksimal 15MB."); return; }
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const reader = new FileReader();
      reader.onloadend = () => setDefectMedia({ url: reader.result as string, type });
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async (mode: 'photo'|'video') => {
    setCameraMode(mode);
    setIsWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: mode === 'video' });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("⚠️ Gagal mengakses kamera atau mikrofon.");
      setIsWebcamOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      setDefectMedia({ url: canvasRef.current.toDataURL('image/jpeg'), type: 'image' });
      stopWebcam(); 
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => setDefectMedia({ url: reader.result as string, type: 'video' });
    };
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopWebcam();
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    setIsWebcamOpen(false);
    setIsRecording(false);
  };

  useEffect(() => { return () => stopWebcam(); }, []);

  // --- FETCH DATA & SESSION USER ---
  useEffect(() => {
    async function fetchDetail() {
      if (!orderItemId) return;
      try {
        const data = await getOrderItemDetail(orderItemId);
        if (data) {
          setDataRefState(data);
        } else {
          setDataRefState(null);
        }

        const resUser = await fetch('/api/auth/me'); 
        if (resUser.ok) {
          const userData = await resUser.json();
          if (userData?.id) {
            setCurrentInspectorId(userData.id);
          }
        }
      } catch (error) { 
        console.error("Gagal memuat referensi QC:", error); 
        setDataRefState(null);
      }
    }
    fetchDetail();
  }, [orderItemId]);

  const handleSaveReport = async () => {
    if (!input.noPiece || input.lebar === 0 || input.panjangYard === 0) {
      alert("⚠️ Lengkapi data utama No. Piece, Lebar, dan Yard Aktual!"); return;
    }
    const finalInspectorId = currentInspectorId || 5; 

    setLoading(true);
    try {
      const payload = {
        orderItemId,
        inspectorId: finalInspectorId, 
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
        keterangan: input.keterangan + `\n\n[Waktu Pengerjaan QC: ${formatTime(qcTimer)}]`,        
        defects 
      }; 

      const result = await createInitialInspection(payload);
      if (result.success) {
        alert("✅ Data Inspeksi Berhasil Disimpan & Dikirim!");
        router.push(`/inspector/check/${rawId}`);
      } else {
        alert(`❌ Gagal menyimpan: ${result.message || "Kesalahan database."}`);
      }
    } catch (err) {
      alert("❌ Terjadi kesalahan koneksi database.");
    } finally {
      setLoading(false);
    }
  };

  if (!dataRefState) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050810] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300">Memuat Data Ref QC...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-32 px-4 md:px-8 font-sans antialiased">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-xl flex flex-col gap-3 mb-6 mt-4">
        <div className="flex items-center justify-between">
          <Link href={`/inspector/check/${rawId}`} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <ArrowLeft size={16} /> Kembali
          </Link>
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
            <Clock size={15} className="text-amber-400" />
            <span className="font-mono text-xs font-black text-amber-400 tracking-wider">{formatTime(qcTimer)}</span>
          </div>
        </div>
        <div className="border-t border-slate-800/80 pt-3 text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400 block mb-1">QC Inspection Panel</span>
          <h1 className="text-sm md:text-base font-black tracking-tight uppercase text-white px-2 break-words">{dataRefState.namaKain}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* SECTION 1: REFERENCE QUALITY DATA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button onClick={() => setIsOpenRef(!isOpenRef)} className="w-full p-4 flex justify-between items-center bg-slate-900 text-white">
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
            <div className="p-4 md:p-6 space-y-4 bg-white dark:bg-slate-900 border-t border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex flex-row gap-4 items-center pb-2">
                <div className="w-20 h-20 bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                  {dataRefState.imageUrl ? (
                    <img src={dataRefState.imageUrl} alt="Reference Spec" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-500"><ImageIcon2 size={20} /><span className="text-[7px] font-black uppercase tracking-widest mt-1">No Spec</span></div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[8px] font-black bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    {dataRefState.kategori?.toUpperCase()}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase truncate">{dataRefState.namaKain}</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-[7px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Desain</span>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 truncate block">{dataRefState.warnaAtauDesain || "-"}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-[7px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Target Vol</span>
                      <span className="text-[10px] font-black text-blue-600 block">{dataRefState.totalYardOrder} YDS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1"><Activity size={10} className="text-blue-500" /> Spesifikasi Target Teknis & Toleransi</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 p-2.5 rounded-xl"><span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase block">Target Lebar</span><span className="text-base font-black text-slate-900 dark:text-slate-200">{dataRefState.targetLebar} <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">inci</span></span></div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 p-2.5 rounded-xl"><span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase block">Toleransi Lebar</span><span className="text-base font-black text-slate-900 dark:text-slate-200">± {dataRefState.toleransiLebar} <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">inci</span></span></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 text-center"><span className="text-[7px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Target GSM Kiri</span><span className="text-xs font-black text-slate-900 dark:text-slate-300">{dataRefState.targetGsmKiri}</span></div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 text-center"><span className="text-[7px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Target GSM Tengah</span><span className="text-xs font-black text-slate-900 dark:text-slate-300">{dataRefState.targetGsmTengah}</span></div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 text-center"><span className="text-[7px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Target GSM Kanan</span><span className="text-xs font-black text-slate-900 dark:text-slate-300">{dataRefState.targetGsmKanan}</span></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 text-center"><span className="text-[7px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Tol. Berat</span><span className="text-[10px] font-black text-slate-900 dark:text-slate-300">± {dataRefState.toleransiBerat}%</span></div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 text-center"><span className="text-[7px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Max Bowing</span><span className="text-[10px] font-black text-slate-900 dark:text-slate-300">{dataRefState.maxBowing} inci</span></div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 text-center"><span className="text-[7px] block text-slate-400 dark:text-slate-500 font-bold uppercase">Max Skewing</span><span className="text-[10px] font-black text-slate-900 dark:text-slate-300">{dataRefState.maxSkewing} inci</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: INPUT DATA AKTUAL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button onClick={() => setIsOpenAktual(!isOpenAktual)} className="w-full p-4 flex justify-between items-center bg-blue-50/20 dark:bg-blue-900/20">
            <div className="flex items-center gap-3"><div className="bg-blue-600 p-2 rounded-xl text-white flex-shrink-0"><ListChecks size={14} /></div><span className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest">02. Input Data Aktual</span></div>
            {isOpenAktual ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          </button>
          
          {isOpenAktual && (
            <div className="p-4 md:p-6 space-y-4 border-t border-blue-50 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">No. Piece</label><input type="text" placeholder="Contoh: PC-01" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none" onChange={(e) => setInput({...input, noPiece: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Lebar Aktual (Inci)</label><input type="number" placeholder="Inci" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none" onChange={(e) => setInput({...input, lebar: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase ml-1">Panjang Yard Aktual</label><input type="number" placeholder="Yds" className="w-full bg-blue-50/50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 p-3 rounded-xl font-black text-sm text-blue-700 dark:text-blue-300 outline-none" onChange={(e) => { const yds = Number(e.target.value); setInput({...input, panjangYard: yds, panjangMeter: Number((yds * 0.9144).toFixed(2))}); }} /></div>
                <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Konversi Meter</label><input type="number" value={input.panjangMeter} readOnly className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-black text-sm text-slate-500 outline-none" /></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 p-3.5 rounded-xl space-y-2">
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase block tracking-wider text-center">Pengukuran GSM Aktual</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1"><label className="text-[7px] text-center font-bold text-slate-400 dark:text-slate-500 block">KIRI</label><input type="number" className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 dark:text-white outline-none" onChange={(e) => setInput({...input, gsmKiri: Number(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[7px] text-center font-bold text-slate-400 dark:text-slate-500 block">TENGAH</label><input type="number" className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 dark:text-white outline-none" onChange={(e) => setInput({...input, gsmTengah: Number(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[7px] text-center font-bold text-slate-400 dark:text-slate-500 block">KANAN</label><input type="number" className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-2.5 rounded-lg text-center font-black text-sm text-slate-900 dark:text-white outline-none" onChange={(e) => setInput({...input, gsmKanan: Number(e.target.value)})} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-xl flex flex-col items-center gap-2 text-center">
                  <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cacat Bowing</span>
                  <div className="flex gap-3 w-full justify-center">
                    <button type="button" onClick={() => setInput({...input, bowing: 0})} className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${input.bowing === 0 ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600"}`}><CheckCircle2 size={12} /> OK</button>
                    <button type="button" onClick={() => setInput({...input, bowing: 1})} className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${input.bowing === 1 ? "bg-rose-600 text-white" : "bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600"}`}><XCircle size={12} /> Cacat</button>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-xl flex flex-col items-center gap-2 text-center">
                  <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cacat Skewing</span>
                  <div className="flex gap-3 w-full justify-center">
                    <button type="button" onClick={() => setInput({...input, skewing: 0})} className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${input.skewing === 0 ? "bg-emerald-600 text-white" : "bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600"}`}><CheckCircle2 size={12} /> OK</button>
                    <button type="button" onClick={() => setInput({...input, skewing: 1})} className={`flex flex-1 items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${input.skewing === 1 ? "bg-rose-600 text-white" : "bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600"}`}><XCircle size={12} /> Cacat</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: MEDIA & DEFECTS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="bg-orange-500 p-2 rounded-xl text-white flex-shrink-0"><Camera size={16}/></div>
            <h2 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">03. Bukti Kerusakan (Media)</h2>
          </div>

          <div className="space-y-3">
            <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleMediaUpload} />
            
            {isWebcamOpen && !defectMedia && (
              <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted={isRecording} className="w-full h-56 object-cover"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                
                <div className="absolute bottom-3 left-0 w-full flex justify-center gap-3 px-4">
                  <button type="button" onClick={stopWebcam} className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-rose-500 transition-colors">BATAL</button>
                  
                  {cameraMode === 'photo' ? (
                    <button type="button" onClick={capturePhoto} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2"><Camera size={16} /> JEPRET</button>
                  ) : (
                    isRecording ? (
                      <button type="button" onClick={stopRecording} className="bg-rose-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 animate-pulse"><StopCircle size={16} /> STOP REKAM</button>
                    ) : (
                      <button type="button" onClick={startRecording} className="bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2"><Video size={16} /> REKAM VIDEO</button>
                    )
                  )}
                </div>
              </div>
            )}

            {!defectMedia && !isWebcamOpen && (
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => startWebcam('photo')} className="w-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                  <Camera size={18} /><span className="font-black uppercase text-[9px]">Kamera</span>
                </button>
                <button type="button" onClick={() => startWebcam('video')} className="w-full bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700/50 text-rose-600 dark:text-rose-400 p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                  <Video size={18} /><span className="font-black uppercase text-[9px]">Video</span>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Upload size={18} /><span className="font-black uppercase text-[9px]">File</span>
                </button>
              </div>
            )}

            {defectMedia && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-black flex items-center justify-center">
                {defectMedia.type === 'image' ? (
                   <img src={defectMedia.url} alt="Defect Captured" className="w-full h-full object-cover" />
                ) : (
                   <video src={defectMedia.url} controls className="w-full h-full object-contain" />
                )}
                <button type="button" onClick={() => setDefectMedia(null)} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg shadow-md hover:bg-rose-600"><XCircle size={16} /></button>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <input type="text" placeholder="Nama Defect (Hole, Kotor, Slub, dll)" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none" value={currentDefect.nama} onChange={(e) => setCurrentDefect({...currentDefect, nama: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase ml-1">Panjang Defect (Inci)</label>
                {/* DITAMBAHKAN: Disable input inci jika isBadSpot atau isMajorDefect aktif */}
                <input type="number" disabled={currentDefect.isBadSpot || currentDefect.isMajorDefect} className="w-full bg-blue-50/40 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 p-3.5 rounded-xl font-black text-sm text-blue-700 dark:text-blue-300 outline-none disabled:opacity-50" value={currentDefect.inci || ""} onChange={(e) => { const val = Number(e.target.value); setCurrentDefect({...currentDefect, inci: val, point: calculatePoint(val, currentDefect.isBadSpot, currentDefect.isMajorDefect)}); }} />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase ml-1">Bobot Poin</label>
                <div className={`p-3 rounded-xl font-black text-center text-lg h-[48px] flex items-center justify-center ${currentDefect.point > 0 ? (currentDefect.isBadSpot ? 'bg-rose-600 text-white' : currentDefect.isMajorDefect ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>{currentDefect.point} Pt</div>
              </div>
            </div>

            {/* DITAMBAHKAN: Opsi Ceklis Bad Spot dan Major Defect (Mutually Exclusive) */}
            <div className="flex flex-col gap-2">
              <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700/50 p-3 rounded-xl flex items-center justify-between transition-colors">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight flex items-center gap-1"><AlertTriangle size={12}/> 1. Bad Spot (Free Yard)</span>
                  <span className="text-[8px] font-bold text-rose-500 dark:text-rose-500">+1 Yard Kompensasi & Langsung 4 Poin</span>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-rose-600 cursor-pointer" 
                  checked={currentDefect.isBadSpot} 
                  onChange={(e) => {
                    const isBS = e.target.checked;
                    setCurrentDefect(prev => ({
                      ...prev, 
                      isBadSpot: isBS,
                      isMajorDefect: isBS ? false : prev.isMajorDefect, 
                      point: calculatePoint(prev.inci, isBS, isBS ? false : prev.isMajorDefect)
                    }));
                  }} 
                />
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700/50 p-3 rounded-xl flex items-center justify-between transition-colors">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-tight flex items-center gap-1"><AlertTriangle size={12}/> 2. Cacat Mayor (Tanpa Free)</span>
                  <span className="text-[8px] font-bold text-orange-500">Kunci di 4 Poin tanpa mengurangi yard tagihan</span>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-orange-600 cursor-pointer" 
                  checked={currentDefect.isMajorDefect} 
                  onChange={(e) => {
                    const isMajor = e.target.checked;
                    setCurrentDefect(prev => ({
                      ...prev, 
                      isMajorDefect: isMajor,
                      isBadSpot: isMajor ? false : prev.isBadSpot, 
                      point: calculatePoint(prev.inci, isMajor ? false : prev.isBadSpot, isMajor)
                    }));
                  }} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase ml-1">Posisi (Yard Ke-)</label>
              <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none" value={currentDefect.yardKe || ""} onChange={(e) => setCurrentDefect({...currentDefect, yardKe: Number(e.target.value)})} />
            </div>

            <button type="button" onClick={handleAddDefect} className="w-full bg-slate-900 text-white p-3.5 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-700"><PlusCircle size={14} /> Tambah Defect Ke Register</button>
          </div>

          {defects.length > 0 && (
            <div className="space-y-1.5 mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Daftar Manifest Kerusakan:</p>
                {/* DITAMBAHKAN: Indikator peringatan Bad Spot */}
                {bsCount > 0 && <span className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase">{bsCount}/4 Bad Spots</span>}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {defects.map((d) => (
                  <div key={d.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {d.foto ? (d.foto.includes('video') ? <Video size={12} className="text-blue-500" /> : <ImageIcon2 size={12} className="text-blue-500" />) : null}
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-tight truncate">
                        {/* DITAMBAHKAN: Badge penanda di daftar manifest */}
                        {d.isBadSpot && <span className="bg-rose-600 text-white text-[8px] px-1 py-0.5 rounded mr-1">BS</span>}
                        {d.isMajorDefect && <span className="bg-orange-500 text-white text-[8px] px-1 py-0.5 rounded mr-1">MAYOR</span>}
                        {d.nama} <span className="text-slate-300 mx-1">|</span> {d.isBadSpot || d.isMajorDefect ? "MAX" : d.inci}" <span className="text-orange-600 font-black">({d.point} Pts)</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => setDefects(defects.filter(x => x.id !== d.id))} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: KETERANGAN AKHIR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6 space-y-2">
          <div className="flex items-center gap-2 mb-1"><FileText size={14} className="text-slate-400" /><h3 className="font-black text-slate-800 dark:text-white uppercase text-[10px] tracking-wider">04. Keterangan Akhir</h3></div>
          <textarea placeholder="Catatan tambahan (opsional)..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl font-medium text-sm text-slate-900 dark:text-white outline-none h-20 resize-none" onChange={(e) => setInput({...input, keterangan: e.target.value})}></textarea>
        </div>

        {/* PENALTY & GRADE SUMMARY */}
        {/* DITAMBAHKAN: Animasi perubahan warna jika melebihi batas Max Bad Spot (Auto Reject) */}
        <div className={`border rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-md flex flex-row items-center justify-between text-white transition-colors duration-500 ${bsCount > 4 ? 'bg-rose-900 border-rose-500' : 'bg-slate-900 border-slate-800'}`}>
          <div className="space-y-0.5">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-wider">Penalty Score</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl md:text-3xl font-black tracking-tight">{bsCount > 4 ? "AUTO REJECT" : penaltyScore.toFixed(2)}</p>
              {bsCount <= 4 && <span className="text-[8px] font-bold text-slate-400 uppercase">Pts/100Y</span>}
            </div>
          </div>
          <div className="text-right">
            <div className={`${getGrade().color} px-5 md:px-7 py-2.5 rounded-xl font-black italic text-sm md:text-base tracking-tighter transform -rotate-1 inline-block border border-white/20`}>{getGrade().label}</div>
          </div>
        </div>

        <button onClick={handleSaveReport} disabled={loading} className="w-full bg-blue-600 text-white p-4 md:p-5 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-slate-300">
          {loading ? "⏳ MENGIRIM DATA..." : "SIMPAN & KIRIM DATA"}
        </button>
      </div>
    </div>
  );
}