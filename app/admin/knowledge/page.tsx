import React from 'react';
import { getKnowledgeList } from "@/server/admin/knowledge-actions";
import { Plus } from 'lucide-react';
import Link from 'next/link';
import KnowledgeTable from './KnowledgeTable';

export default async function AdminKnowledgePage() {
  // Fetch data dari server
  const knowledgeList = await getKnowledgeList();

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto p-4 md:p-8 text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Daftar <span className="text-black-600">Knowledge Base</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Kelola Artikel Panduan / Kamus untuk Inspector & Pimpinan.
          </p>
        </div>
        
        {/* Tombol menuju halaman Create */}
       <Link 
  href="/admin/knowledge/create" 
  className="bg-black hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-black/20"
>
  <Plus size={16} /> Tambah Artikel Baru
</Link>
      </div>

      {/* Memanggil Komponen Tabel */}
      <KnowledgeTable knowledgeList={knowledgeList} />
    </div>
  );
}