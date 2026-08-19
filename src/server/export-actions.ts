"use server";

import { db } from "@/db";
import { inspections, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";

export async function exportOrderToExcel(orderItemId: number) {
  try {
    // 1. Ambil data Order Item untuk mendapatkan nama kain
    const orderItem = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, orderItemId),
      with: {
        fabricType: true,
      },
    });

    if (!orderItem) {
      throw new Error("Order Item tidak ditemukan.");
    }

    // 2. Ambil semua data inspeksi untuk order item tersebut
    const inspectionData = await db.query.inspections.findMany({
      where: eq(inspections.orderItemId, orderItemId),
      orderBy: (inspections, { asc }) => [asc(inspections.nomorPiece)],
    });

    if (inspectionData.length === 0) {
        return { success: false, message: "Tidak ada data inspeksi untuk diekspor." };
    }

    // 3. Siapkan data untuk worksheet
    const dataForSheet = inspectionData.map((insp) => ({
      "No. Piece": insp.nomorPiece,
      "Grade": insp.grade,
      "Panjang (Yard)": insp.panjangYardAktual,
      "Total Poin": insp.totalPoints,
      "Skor Penalti": insp.pointsPer100Sqy,
      "Tanggal Inspeksi": insp.tanggalInspeksi?.toLocaleDateString("id-ID") ?? "-",
    }));

    // 4. Buat Workbook dan Worksheet menggunakan 'xlsx'
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

    // Tambahkan nama file dinamis
    const fileName = `Inspeksi_${orderItem.fabricType?.namaKain.replace(/ /g, "_") ?? "Export"}.xlsx`;
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Inspeksi");

    // 5. Ubah workbook menjadi buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return { success: true, data: buffer.toString("base64"), fileName };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}