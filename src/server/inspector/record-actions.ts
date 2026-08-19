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
  isBadSpot?: boolean;     // DITAMBAHKAN: Flag untuk Free Yard Auto-Reject
  isMajorDefect?: boolean; // DITAMBAHKAN: Flag untuk Max 4 Poin saja
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

//  Membuat record inspeksi baru dengan menyimpan GSM Aktual
export async function createInitialInspection(data: {
  orderItemId: number,
  inspectorId: number,
  noPiece: string,
  lebarAktual: number,
  beratAktual: number,
  panjangYard: number, 
  panjangMeter: number,
  gsmKiri: number, 
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

    // DITAMBAHKAN: Ekstrak jumlah Bad Spot
    const badSpotCount = data.defects.filter(d => d.isBadSpot).length;

    // Menentukan Grade
    let finalGrade: 'A' | 'B' | 'C' | 'Reject' = 'A';
    
    // DITAMBAHKAN: Aturan jika Bad Spot > 4 otomatis Reject
    if (badSpotCount > 4) {
      finalGrade = 'Reject';
    } else {
      if (penaltyScore > 40) finalGrade = 'C';
      else if (penaltyScore > 20) finalGrade = 'B';
    }

    // DITAMBAHKAN: Penambahan Keterangan Otomatis mengenai Free Yard
    let keteranganModifikasi = data.keterangan || "";
    if (badSpotCount > 0) {
      keteranganModifikasi += `\n[SISTEM AUTO-NOTE: Terdapat ${badSpotCount} Titik Bad Spot (Kompensasi Free ${badSpotCount} Yard)]`;
    }

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
        keteranganPimpinan: keteranganModifikasi,
        totalPoints: totalPoin,
        pointsPer100Sqy: parseFloat(penaltyScore.toFixed(2)),
        grade: finalGrade,
      }).returning({ id: inspections.id });

      if (data.defects.length > 0) {
        await tx.insert(defects).values(data.defects.map((d) => {
          // DITAMBAHKAN: Tagging khusus di nama defect untuk tracking DB tanpa mengubah Schema
          let formatNamaDefect = d.nama;
          if (d.isBadSpot) formatNamaDefect = `[BS] ${d.nama}`;
          else if (d.isMajorDefect) formatNamaDefect = `[MAJOR] ${d.nama}`;

          return {
            inspectionId: newInspection.id,
            jenisDefect: formatNamaDefect,
            ukuranInci: d.inci,
            poin: d.point,
            posisiYard: d.yardKe,
          };
        }));
      }

      return { success: true, inspectionId: newInspection.id };
    });

  } catch (error) {
    console.error("Gagal inisialisasi inspeksi:", error);
    return { success: false, message: "Database error" };
  }
}

/**
 * Kalkulasi ulang jika ada perubahan data defect
 */
export async function updateAutoKalkulasi(inspectionId: number) {
  try {
    const defectList = await db.select({
      poin: defects.poin,
      jenisDefect: defects.jenisDefect // Perlu ditarik untuk membaca Tag BS
    }).from(defects).where(eq(defects.inspectionId, inspectionId));

    const [info] = await db.select({
      lebar: inspections.lebarAktual,
      yard: inspections.panjangYardAktual
    }).from(inspections).where(eq(inspections.id, inspectionId));

    const totalPoints = defectList.reduce((acc, curr) => acc + (curr.poin || 0), 0);
    const score = (totalPoints * 3600) / (Number(info.yard) * Number(info.lebar));
    
    // DITAMBAHKAN: Deteksi BS melalui string tag untuk memicu ulang aturan Auto-Reject
    const bsCount = defectList.filter(d => d.jenisDefect && d.jenisDefect.includes('[BS]')).length;

    let grade: 'A' | 'B' | 'C' | 'Reject' = 'A';
    
    if (bsCount > 4) {
      grade = 'Reject';
    } else {
      if (score > 40) grade = 'C'; 
      else if (score > 20) grade = 'B';
    }

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