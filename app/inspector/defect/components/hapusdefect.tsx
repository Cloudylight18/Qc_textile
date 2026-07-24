"use client"

import React, { useState } from 'react';
import { deleteDefect } from '@/server/inspector/defect-actions';
import { Trash2 } from 'lucide-react';

interface HapusDefectProps {
  id: number; // PERBAIKAN: Ubah menjadi number
}

export default function HapusDefect({ id }: HapusDefectProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data defect ini? Data yang dihapus tidak bisa dikembalikan.")) {
      setIsDeleting(true);
      const result = await deleteDefect(id);
      
      if (!result.success) {
        alert(result.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-800 rounded transition-colors disabled:opacity-50" 
      title="Hapus Data"
    >
      <Trash2 size={16} />
    </button>
  );
}