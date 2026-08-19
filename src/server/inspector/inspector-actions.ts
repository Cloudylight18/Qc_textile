"use server"

import { db } from "@/db";
import { 
  orders, 
  orderItems, 
  fabricTypes, 
  inspections, 
  defects,
  users
} from "@/db/schema"; 
import { eq, or, desc, sql, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// --- TYPES ---
export interface AssignedOrder {
  orderId: number;
  tanggal: Date | null;
  namaKain: string | null;
  totalYard: number | null;
  keterangan: string | null;
}

export interface DefectInput {
  kodeDefect?: string; 
  nama: string;
  inci: number;
  point: number;
  yardKe: number;
  namaSupplier?: string; 
  foto?: string | null; // Bisa Base64 Gambar atau Video
}

// --- UTILITY MENYIMPAN MEDIA (FOTO/VIDEO) LOKAL ---
async function saveDefectMediaLocal(base64Data: string): Promise<string> {
  try {
    const UPLOAD_DIR = join(process.cwd(), "public/uploads/defects");
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const matches = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    const mimeType = matches ? matches[1] : "image/jpeg";
    const base64Content = base64Data.replace(/^data:.*,/, "");
    const buffer = Buffer.from(base64Content, 'base64');
    
    let ext = 'jpg';
    if (mimeType.includes('video/webm')) ext = 'webm';
    else if (mimeType.includes('video/mp4')) ext = 'mp4';
    else if (mimeType.includes('png')) ext = 'png';

    const uniqueFilename = `defect_${Date.now()}.${ext}`;
    const filePath = join(UPLOAD_DIR, uniqueFilename);
    
    writeFileSync(filePath, buffer);
    return `/uploads/defects/${uniqueFilename}`;
  } catch (error) {
    console.error("Gagal menyimpan media defect:", error);
    return "";
  }
}

export async function getOrderItemDetail(id: number) {
  try {
    const result = await db.select({
      id: orderItems.id,
      kategori: orderItems.kategori,
      warnaAtauDesain: orderItems.warnaAtauDesain,
      totalYardOrder: orderItems.totalYardOrder,
      namaKain: fabricTypes.namaKain,
      targetLebar: fabricTypes.targetLebar,
      toleransiLebar: fabricTypes.toleransiLebar,
      targetGsmKiri: fabricTypes.targetGsmKiri,
      targetGsmTengah: fabricTypes.targetGsmTengah,
      targetGsmKanan: fabricTypes.targetGsmKanan,
      toleransiBerat: fabricTypes.toleransiBerat,
      maxBowing: fabricTypes.maxBowing,
      maxSkewing: fabricTypes.maxSkewing,
    })
    .from(orderItems)
    .innerJoin(fabricTypes, eq(orderItems.fabricTypeId, fabricTypes.id))
    .where(eq(orderItems.id, id))
    .limit(1);

    return result[0] ?? null;
  } catch (error) {
    console.error("Gagal ambil detail item:", error);
    return null;
  }
}

export async function getAssignedOrders(inspectorId: number): Promise<AssignedOrder[]> {
  try {
    const assignments = await db.select({
      orderId: orders.id,
      tanggal: orders.tanggalOrder,
      keterangan: orders.keterangan,
      namaKain: fabricTypes.namaKain,
      totalYard: orderItems.totalYardOrder,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .innerJoin(fabricTypes, eq(orderItems.fabricTypeId, fabricTypes.id))
    .where(
      or(
        eq(orders.qcUserId1, inspectorId),
        eq(orders.qcUserId2, inspectorId),
        eq(orders.qcUserId3, inspectorId)
      )
    )
    .orderBy(desc(orders.tanggalOrder));

    return assignments ?? [];
  } catch (error) {
    console.error("Gagal ambil tugas inspector:", error);
    return []; 
  }
}

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

    let finalGrade: 'A' | 'B' | 'C' = 'A';
    if (penaltyScore > 40) finalGrade = 'C';
    else if (penaltyScore > 20) finalGrade = 'B';

    // 1. Simpan Header Inspeksi
    const newInspection = await db.insert(inspections).values({
      orderItemId: data.orderItemId,
      inspectorId: data.inspectorId,
      nomorPiece: data.noPiece,
      lebarAktual: sql`${data.lebarAktual}`,
      beratAktual: sql`${data.beratAktual}`,
      panjangYardAktual: sql`${data.panjangYard}`,
      panjangMeterAktual: sql`${data.panjangMeter}`,
      gsmKiriAktual: sql`${data.gsmKiri}`,
      gsmTengahAktual: sql`${data.gsmTengah}`,
      gsmKananAktual: sql`${data.gsmKanan}`,
      bowingAktual: sql`${data.bowing}`,
      skewingAktual: sql`${data.skewing}`,
      catatanInspector: data.keterangan || "",
      totalPoints: totalPoin,
      pointsPer100Sqy: sql`${penaltyScore.toFixed(2)}`,
      grade: finalGrade,
    }).returning({ insertedId: inspections.id });

    const inspectionId = newInspection[0].insertedId;

    // 2. Proses dan Simpan Foto/Video lalu masukkan ke tabel Defects
    if (data.defects.length > 0) {
      const defectValues = await Promise.all(data.defects.map(async (d) => {
        let finalMediaUrl = null;
        if (d.foto && d.foto.startsWith("data:")) {
          finalMediaUrl = await saveDefectMediaLocal(d.foto);
        } else if (d.foto) {
          finalMediaUrl = d.foto; 
        }

        return {
          inspectionId: inspectionId,
          jenisDefect: d.nama,
          kodeDefect: d.kodeDefect || null, 
          ukuranInci: d.inci,
          poin: d.point,
          posisiYard: d.yardKe,
          namaSupplier: d.namaSupplier || null, 
          fotoDefectUrl: finalMediaUrl,
        };
      }));
      
      await db.insert(defects).values(defectValues as any);
    }

    revalidatePath("/inspector/dashboard");
    revalidatePath("/inspector/defect"); 
    
    return { success: true, inspectionId: inspectionId };
  } catch (error) {
    console.error("Gagal inisialisasi inspeksi:", error);
    return { success: false, message: "Gagal membuat data inspeksi." };
  }
}



export async function getInspectionForEdit(inspectionId: number) {
  try {
    const data = await db.query.inspections.findFirst({
      where: eq(inspections.id, inspectionId),
      with: { defects: true }
    });
    return data;
  } catch (error) {
    console.error("Gagal mengambil data inspeksi:", error);
    return null;
  }
}

export async function updateInspectionRecord(inspectionId: number, data: any) {
  try {
    const totalPoin = data.defects.reduce((acc: any, curr: any) => acc + curr.point, 0);
    const yard = data.panjangYard || 1;
    const lbr = data.lebarAktual || 1;
    const penaltyScore = (totalPoin * 3600) / (yard * lbr);

    let finalGrade: 'A' | 'B' | 'C' = 'A';
    if (penaltyScore > 40) finalGrade = 'C';
    else if (penaltyScore > 20) finalGrade = 'B';

    // Update Header
    await db.update(inspections).set({
      nomorPiece: data.noPiece,
      lebarAktual: sql`${data.lebarAktual}`,
      beratAktual: sql`${data.beratAktual}`,
      panjangYardAktual: sql`${data.panjangYard}`,
      panjangMeterAktual: sql`${data.panjangMeter}`,
      gsmKiriAktual: sql`${data.gsmKiri}`,
      gsmTengahAktual: sql`${data.gsmTengah}`,
      gsmKananAktual: sql`${data.gsmKanan}`,
      bowingAktual: sql`${data.bowing}`,
      skewingAktual: sql`${data.skewing}`,
      catatanInspector: data.keterangan || "",
      totalPoints: totalPoin,
      pointsPer100Sqy: sql`${penaltyScore.toFixed(2)}`,
      grade: finalGrade,
    }).where(eq(inspections.id, inspectionId));

    // Update Defects (Hapus yang lama, insert yang baru)
    await db.delete(defects).where(eq(defects.inspectionId, inspectionId));

    if (data.defects.length > 0) {
      const defectValues = await Promise.all(data.defects.map(async (d: any) => {
        let finalMediaUrl = d.foto;
        if (d.foto && d.foto.startsWith("data:")) {
          finalMediaUrl = await saveDefectMediaLocal(d.foto);
        }
        return {
          inspectionId: inspectionId,
          jenisDefect: d.nama,
          ukuranInci: d.inci,
          poin: d.point,
          posisiYard: d.yardKe,
          namaSupplier: d.namaSupplier || null,
          fotoDefectUrl: finalMediaUrl || null,
        };
      }));
      await db.insert(defects).values(defectValues as any);
    }

    revalidatePath("/inspector");
    return { success: true };
  } catch (error) {
    console.error("Gagal update inspeksi:", error);
    return { success: false, message: "Gagal update data inspeksi." };
  }
}