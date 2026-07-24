"use server";

import { db } from "@/db";
import { fabricTypes } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// --- CREATE ---
export async function createKainAction(formData: FormData) {
  // Parsing data dari form sesuai field L-C-R
  const namaKain = formData.get("namaKain") as string;
  
  const targetLebar = parseFloat(formData.get("targetLebar") as string) || 0;
  const toleransiLebar = parseFloat(formData.get("toleransiLebar") as string) || 0;
  
  // Field GSM L-C-R Baru
  const targetGsmKiri = parseFloat(formData.get("targetGsmKiri") as string) || 0;
  const targetGsmTengah = parseFloat(formData.get("targetGsmTengah") as string) || 0;
  const targetGsmKanan = parseFloat(formData.get("targetGsmKanan") as string) || 0;
  const toleransiBerat = parseFloat(formData.get("toleransiBerat") as string) || 0;
  
  const maxBowing = parseFloat(formData.get("maxBowing") as string) || 0;
  const maxSkewing = parseFloat(formData.get("maxSkewing") as string) || 0;

  
  try {
    await db.insert(fabricTypes).values({
      namaKain,
      targetLebar,
      toleransiLebar,
      targetGsmKiri,
      targetGsmTengah,
      targetGsmKanan,
      toleransiBerat,
      maxBowing,
      maxSkewing,
    });

    revalidatePath("/admin/master/jenis-kain");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Gagal menambahkan data kain" };
  }
}

// --- UPDATE ---
export async function updateKainAction(id: number, formData: FormData) {
  const namaKain = formData.get("namaKain") as string;
  const targetLebar = parseFloat(formData.get("targetLebar") as string) || 0;
  const toleransiLebar = parseFloat(formData.get("toleransiLebar") as string) || 0;
  
  // Update L-C-R di fungsi Edit
  const targetGsmKiri = parseFloat(formData.get("targetGsmKiri") as string) || 0;
  const targetGsmTengah = parseFloat(formData.get("targetGsmTengah") as string) || 0;
  const targetGsmKanan = parseFloat(formData.get("targetGsmKanan") as string) || 0;
  const toleransiBerat = parseFloat(formData.get("toleransiBerat") as string) || 0;
  
  const maxBowing = parseFloat(formData.get("maxBowing") as string) || 0;
  const maxSkewing = parseFloat(formData.get("maxSkewing") as string) || 0;

  try {
    await db.update(fabricTypes)
      .set({
        namaKain,
        targetLebar,
        toleransiLebar,
        targetGsmKiri,
        targetGsmTengah,
        targetGsmKanan,
        toleransiBerat,
        maxBowing,
        maxSkewing,
      })
      .where(eq(fabricTypes.id, id));

    revalidatePath("/admin/master/jenis-kain");
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, message: "Gagal memperbarui data kain" };
  }
}

// --- DELETE ---
export async function deleteKainAction(id: number) {
  try {
    await db.delete(fabricTypes).where(eq(fabricTypes.id, id));
    revalidatePath("/admin/master/jenis-kain");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Gagal menghapus data" };
  }
}