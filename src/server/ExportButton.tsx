"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { exportOrderToExcel } from "@/server/export-actions";

export default function ExportButton({ orderItemId }: { orderItemId: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Mempersiapkan file Excel...");

    const result = await exportOrderToExcel(orderItemId);

    if (result.success && result.data) {
      try {
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = result.fileName || "export.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Ekspor berhasil! File sedang diunduh.", { id: toastId });
      } catch (e) {
        toast.error("Gagal mengunduh file.", { id: toastId });
      }
    } else {
      toast.error(result.message || "Gagal mengekspor data.", { id: toastId });
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:bg-slate-400"
    >
      <FileDown size={14} />
      {isLoading ? "Mengekspor..." : "Ekspor Excel"}
    </button>
  );
}