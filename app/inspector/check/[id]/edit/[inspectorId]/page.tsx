import { getInspectionForEdit } from "@/server/inspector/inspector-actions";
import EditInspectionForm from "./EditInspectionForm"; 
import { AlertTriangle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function EditInspectionPage(props: { params: any }) {
  const resolvedParams = await props.params;
  const orderItemId = Number(resolvedParams?.id || 0);
  
  // Otomatis mendeteksi variasi nama parameter di folder [id] dsb.
  const rawInspId = 
    resolvedParams?.inspectionid || 
    resolvedParams?.inspectionId || 
    resolvedParams?.inspectorid || 
    resolvedParams?.inspectorId;
    
  const inspectionId = Number(rawInspId || 0);

  if (!inspectionId || isNaN(inspectionId)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6 text-white font-sans antialiased">
        <div className="bg-rose-950/30 p-8 rounded-[2rem] border border-rose-500/30 text-center space-y-4 max-w-lg shadow-xl">
          <AlertTriangle size={48} className="text-rose-500 mx-auto" />
          <h1 className="text-xl font-black text-rose-500 tracking-tight">PARAMETER ID TIDAK TERBACA</h1>
          <p className="text-sm text-slate-400 font-medium">Parameter URL tidak cocok. Data diterima: {JSON.stringify(resolvedParams)}</p>
          <a href={`/inspector/check/${orderItemId}`} className="inline-block mt-4 bg-slate-900 border border-slate-700 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Kembali</a>
        </div>
      </div>
    );
  }

  // Menarik Data dari Database (Berdasarkan ID Inspeksi yang ingin diedit)
  const data = await getInspectionForEdit(inspectionId);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6 text-white font-sans antialiased">
        <div className="bg-amber-950/30 p-8 rounded-[2rem] border border-amber-500/30 text-center space-y-4 max-w-lg shadow-xl">
          <AlertTriangle size={48} className="text-amber-500 mx-auto" />
          <h1 className="text-xl font-black text-amber-500 tracking-tight">DATA TIDAK DITEMUKAN</h1>
          <p className="text-sm text-slate-400 font-medium">Data dengan ID <b className="text-white">{inspectionId}</b> tidak ada di tabel database.</p>
          <a href={`/inspector/check/${orderItemId}`} className="inline-block mt-4 bg-slate-900 border border-slate-700 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Kembali</a>
        </div>
      </div>
    );
  }

  return (
    <EditInspectionForm 
      orderItemId={orderItemId} 
      inspectionId={inspectionId} 
      initialData={data} 
    />
  );
}