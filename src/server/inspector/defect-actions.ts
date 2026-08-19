"use server"

import { db } from "@/db";
import { defects } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, ilike, desc } from "drizzle-orm";

export interface DefectRecord {
  id: number;
  inspectionId?: number | null;
  jenisDefect: string;
  ukuranInci: number;
  poin: number;
  posisiYard: number;
  fotoDefectUrl: string | null;
  kodeDefect?: string | null;
  namaSupplier?: string | null;
  createdAt?: string | null;
}

export async function getDefects(query?: string): Promise<DefectRecord[]> {
  try {
    // PERBAIKAN: Bersihkan spasi kosong agar tidak error di ilike postgres
    const cleanQuery = query?.trim();

    if (cleanQuery && cleanQuery.length > 0) {
      const data = await db
        .select()
        .from(defects)
        .where(ilike(defects.jenisDefect, `%${cleanQuery}%`))
        .orderBy(desc(defects.id));
      return data as unknown as DefectRecord[];
    } else {
      const data = await db
        .select()
        .from(defects)
        .orderBy(desc(defects.id));
      return data as unknown as DefectRecord[];
    }
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    return [];
  }
}


export async function addManualDefect(formData: FormData) {
  try {
    const jenisDefect = formData.get("jenisDefect") as string;
    const kodeDefect = formData.get("kodeDefect") as string;
    const fotoDefectUrl = formData.get("fotoDefectUrl") as string;
    const namaSupplier = formData.get("namaSupplier") as string;
    
    const poin = Number(formData.get("poin")) || 0;
    const posisiYard = Number(formData.get("posisiYard")) || 0;

    await db.insert(defects).values({
      jenisDefect,
      fotoDefectUrl,
      ukuranInci: 0, 
      poin,
      posisiYard,
      kodeDefect: kodeDefect || null,
      namaSupplier: namaSupplier || null,
    } as any);

    revalidatePath("/inspector/defect"); 
    return { success: true };
  } catch (error) {
    console.error("Gagal menyimpan defect manual:", error);
    return { success: false, message: "Gagal menyimpan ke database." };
  }
}


export async function updateDefect(id: number, formData: FormData) {
  try {
    const jenisDefect = formData.get("jenisDefect") as string;
    const kodeDefect = formData.get("kodeDefect") as string;
    const fotoDefectUrl = formData.get("fotoDefectUrl") as string;
    const namaSupplier = formData.get("namaSupplier") as string;
    
    const poin = Number(formData.get("poin")) || 0;
    const posisiYard = Number(formData.get("posisiYard")) || 0;

    const updateData: any = {
      jenisDefect,
      poin,
      posisiYard,
      kodeDefect: kodeDefect || null,
      namaSupplier: namaSupplier || null,
    };

    if (fotoDefectUrl) updateData.fotoDefectUrl = fotoDefectUrl;

    await db.update(defects)
      .set(updateData)
      .where(eq(defects.id, id)); 

    revalidatePath("/inspector/defect");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengupdate defect:", error);
    return { success: false, message: "Gagal mengupdate data di database." };
  }
}


export async function deleteDefect(id: number) {
  try {
    await db.delete(defects).where(eq(defects.id, id));
    revalidatePath("/inspector/defect");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus defect:", error);
    return { success: false, message: "Gagal menghapus data dari database." };
  }
}