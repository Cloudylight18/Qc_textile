import React from 'react';
import { addKnowledgeItem } from "@/server/admin/knowledge-actions";
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function CreateKnowledgePage() {
  async function handleAdd(formData: FormData) {
    "use server";
    await addKnowledgeItem(formData);
    redirect('/admin/knowledge'); // Otomatis kembali ke halaman list setelah simpan
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto p-4 md:p-8 text-slate-900 dark:text-white">
      <div>
        <Link href="/admin/knowledge" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest mb-4 transition-colors">
          <ArrowLeft size={14} /> Kembali ke Daftar
        </Link>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          Tambah <span className="text-blue-600">Knowledge Base</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Tulis artikel panduan atau kamus baru untuk sistem.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-xl">
        <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Plus size={16} className="text-blue-500" /> Form Artikel Baru
        </h2>
        <form action={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Judul / Nama Istilah (Cth: Cara Refund, GSM)</label>
            <input name="term" required placeholder="Tulis judul artikel..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Isi Artikel / Penjelasan Detail</label>
            <textarea name="description" required rows={5} placeholder="Tulis penjelasan lengkap di sini..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 resize-y"></textarea>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            Simpan Artikel ke Database
          </button>
        </form>
      </div>
    </div>
  );
}