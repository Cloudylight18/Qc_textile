"use client"

import React, { useState, useRef } from 'react';
import { addManualDefect } from '@/server/inspector/defect-actions';
import { Plus, X, UploadCloud } from 'lucide-react';

export default function TambahDefect() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran maksimal 2MB."); 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imagePreview) return alert("Harap unggah foto defect.");
    
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("fotoDefectUrl", imagePreview);
    
    const result = await addManualDefect(formData);
    if (result.success) {
      setIsOpen(false);
      setImagePreview(null);
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shrink-0">
        <Plus size={14} /> Tambah Defect
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0b0f19] border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mb-6">Tambah <span className="text-blue-600">Manual</span></h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Foto Defect</label>
                <div onClick={() => fileInputRef.current?.click()} className={`w-full relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer flex flex-col items-center justify-center ${imagePreview ? 'border-slate-700 bg-slate-900 aspect-square' : 'border-slate-700 hover:border-blue-500 bg-slate-900/50 py-10'}`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <><UploadCloud className="text-slate-500 mb-3" size={32} /><p className="text-slate-400 text-xs font-bold">Tap untuk Upload</p></>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] text-slate-500 mb-1">Nama Defect</label><input required name="jenisDefect" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm" /></div>
                <div><label className="block text-[10px] text-slate-500 mb-1">Kode</label><input name="kodeDefect" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] text-slate-500 mb-1">Poin</label><input required name="poin" type="number" min="1" max="4" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm" /></div>
                <div><label className="block text-[10px] text-slate-500 mb-1">Posisi Yard</label><input required name="posisiYard" type="number" step="0.1" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm" /></div>
              </div>
              <div><label className="block text-[10px] text-slate-500 mb-1">Supplier</label><input name="namaSupplier" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm" /></div>
              
              <button type="submit" disabled={isLoading || !imagePreview} className="w-full bg-blue-600 text-white px-5 py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 mt-4">
                {isLoading ? "Menyimpan..." : "Simpan Defect"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}