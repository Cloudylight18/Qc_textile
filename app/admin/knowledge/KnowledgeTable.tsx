"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, X, AlertTriangle } from 'lucide-react';
import { deleteKnowledgeItem, updateKnowledgeItem } from "@/server/admin/knowledge-actions";

export default function KnowledgeTable({ knowledgeList }: { knowledgeList: any[] }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<{id: number, term: string, description: string} | null>(null);

  // State untuk Modal Konfirmasi Hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk Pagination (6 item per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset ke halaman 1 jika daftar knowledge berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [knowledgeList]);

  // Kalkulasi data untuk pagination
  const totalPages = Math.ceil(knowledgeList.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentKnowledge = knowledgeList.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const openEditModal = (item: any) => {
    setEditData(item);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditData(null);
  };

  const openDeleteModal = (item: any) => {
    setDeleteTarget(item);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  // Fungsi untuk memanggil server action update
  const handleUpdate = async (formData: FormData) => {
    if (editData) {
      formData.append('id', editData.id.toString());
      await updateKnowledgeItem(formData);
      closeEditModal();
    }
  };

  // Fungsi untuk mengeksekusi penghapusan
  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      try {
        await deleteKnowledgeItem(deleteTarget.id);
        closeDeleteModal();
      } catch (error) {
        console.error("Gagal menghapus artikel:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl mt-8 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-widest font-black text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-5">Judul Artikel / Istilah</th>
                <th className="px-6 py-5">Isi Panduan</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {currentKnowledge.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Belum ada artikel panduan.
                  </td>
                </tr>
              ) : (
                currentKnowledge.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.term}</span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-3">{item.description}</p>
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-colors cursor-pointer"
                          title="Edit Artikel"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        <button 
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors cursor-pointer"
                          title="Hapus Artikel"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {knowledgeList.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, knowledgeList.length)} dari {knowledgeList.length} artikel
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 h-8 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Prev
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                    currentPage === pageNumber
                      ? "bg-black text-white shadow-lg shadow-black/20 border border-black dark:border-slate-700"
                      : "bg-slate-200 dark:bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 h-8 md:h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POP-UP MODAL EDIT */}
      {isEditOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
                <Edit2 size={16} className="text-blue-500" /> Edit Artikel
              </h2>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form action={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Judul / Nama Istilah</label>
                <input 
                  name="term" 
                  defaultValue={editData.term} 
                  required 
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Isi Artikel</label>
                <textarea 
                  name="description" 
                  defaultValue={editData.description} 
                  required 
                  rows={5} 
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 resize-y"
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={closeEditModal} className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL KONFIRMASI DELETE */}
      {isDeleteOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b0f19] border border-red-500/20 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-200 relative">
            
            {/* Ikon Warning */}
            <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
              <AlertTriangle size={32} />
            </div>

            {/* Teks Peringatan */}
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-wider text-white italic">
                DELETE <span className="text-red-500">ARTICLE?</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-2">
                Anda akan menghapus artikel <span className="text-white font-bold">&quot;{deleteTarget.term}&quot;</span> secara permanen dari sistem knowledge base.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                type="button" 
                onClick={closeDeleteModal} 
                disabled={isDeleting}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete} 
                disabled={isDeleting}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "DELETING..." : "Confirm"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}