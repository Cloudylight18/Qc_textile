"use server"

import { db } from "@/db";
import { orders, orderItems, fabricTypes, inspections, defects } from "@/db/schema"; 
import { eq, or, desc, sql, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- TYPES ---
export interface DefectInput {
  nama: string;
  inci: number;
  point: number;
  yardKe: number;
}

export async function getOrderWithInspections(orderItemId: number) {
  // Ambil data item kain
  const item = await db.select({
    id: orderItems.id,
    fabricName: fabricTypes.namaKain,
    warnaAtauDesain: orderItems.warnaAtauDesain,
  })
  .from(orderItems)
  .innerJoin(fabricTypes, eq(orderItems.fabricTypeId, fabricTypes.id))
  .where(eq(orderItems.id, orderItemId));

  // Ambil riwayat inspeksi
  const history = await db.select()
    .from(inspections)
    .where(eq(inspections.orderItemId, orderItemId));

  if (!item[0]) return null;

  return {
    ...item[0],
    inspections: history
  };
}

/**
 * Membuat record inspeksi baru dengan menyimpan GSM Aktual
 */
export async function createInitialInspection(data: {
  orderItemId: number,
  inspectorId: number,
  noPiece: string,
  lebarAktual: number,
  beratAktual: number,
  panjangYard: number, 
  panjangMeter: number,
  gsmKiri: number, // Data GSM
  gsmTengah: number,
  gsmKanan: number,
  bowing: number,
  skewing: number,
  keterangan?: string,
  defects: DefectInput[]
}) {
  try {
    const totalPoin = data.defects.reduce((acc, curr) => acc + curr.point, 0);
    const yard = data.panjangYard || 1;
    const lbr = data.lebarAktual || 1;
    const penaltyScore = (totalPoin * 3600) / (yard * lbr);

    // Menentukan Grade
    let finalGrade: 'A' | 'B' | 'C' | 'Reject' = 'A';
    if (penaltyScore > 40) finalGrade = 'C';
    else if (penaltyScore > 20) finalGrade = 'B';

    // Transaction memastikan Inspeksi dan Defect tersimpan bersamaan
    return await db.transaction(async (tx) => {
      const [newInspection] = await tx.insert(inspections).values({
        orderItemId: data.orderItemId,
        inspectorId: data.inspectorId,
        nomorPiece: data.noPiece,
        lebarAktual: data.lebarAktual,
        beratAktual: data.beratAktual,
        gsmKiriAktual: data.gsmKiri,
        gsmTengahAktual: data.gsmTengah,
        gsmKananAktual: data.gsmKanan,
        panjangYardAktual: data.panjangYard,
        panjangMeterAktual: data.panjangMeter,
        bowingAktual: data.bowing,
        skewingAktual: data.skewing,
        keteranganPimpinan: data.keterangan || "",
        totalPoints: totalPoin,
        pointsPer100Sqy: parseFloat(penaltyScore.toFixed(2)),
        grade: finalGrade,
      }).returning({ id: inspections.id });

      if (data.defects.length > 0) {
        await tx.insert(defects).values(data.defects.map((d) => ({
          inspectionId: newInspection.id,
          jenisDefect: d.nama,
          ukuranInci: d.inci,
          poin: d.point,
          posisiYard: d.yardKe,
        })));
      }

      return { success: true, inspectionId: newInspection.id };
    });

  } catch (error) {
    console.error("Gagal inisialisasi inspeksi:", error);
    return { success: false, error: "Database error" };
  }
}

/**
 * Kalkulasi ulang jika ada perubahan data defect
 */
export async function updateAutoKalkulasi(inspectionId: number) {
  try {
    const [stats] = await db.select({
      total: sum(defects.poin),
    }).from(defects).where(eq(defects.inspectionId, inspectionId));

    const [info] = await db.select({
      lebar: inspections.lebarAktual,
      yard: inspections.panjangYardAktual
    }).from(inspections).where(eq(inspections.id, inspectionId));

    const totalPoints = Number(stats?.total || 0);
    const score = (totalPoints * 3600) / (Number(info.yard) * Number(info.lebar));
    
    let grade: 'A' | 'B' | 'C' | 'Reject' = 'A';
    if (score > 40) grade = 'C'; else if (score > 20) grade = 'B';

    await db.update(inspections).set({
      totalPoints,
      pointsPer100Sqy: parseFloat(score.toFixed(2)),
      grade
    }).where(eq(inspections.id, inspectionId));
    
    revalidatePath("/inspector");
  } catch (err) {
    console.error("Auto calc error:", err);
  }
}