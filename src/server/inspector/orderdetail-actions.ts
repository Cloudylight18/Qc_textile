"use server";

import { db } from "@/db";
import { orders, orderItems, users, suppliers, fabricTypes, inspections } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// =====================================================================================
// UTILITY: FUNGSI UNTUK MENYIMPAN GAMBAR BASE64 KE FOLDER LOCAL
// =====================================================================================
export async function uploadFabricImage(base64Data: string, filename: string): Promise<string> {
  try {
    const UPLOAD_DIR = join(process.cwd(), "public/uploads/kain");

    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) throw new Error("Format gambar Base64 tidak valid");

    const buffer = Buffer.from(base64Image, 'base64');
    
    const ext = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `kain_${Date.now()}.${ext}`;
    const filePath = join(UPLOAD_DIR, uniqueFilename);

    writeFileSync(filePath, buffer);

    return `/uploads/kain/${uniqueFilename}`;
  } catch (error) {
    console.error("Gagal menyimpan gambar di server:", error);
    throw new Error("Gagal mengunggah gambar");
  }
}

/**
 * 1. AMBIL DATA MASTER
 */
export async function getFormData() {
  try {
    const [s, f, u] = await Promise.all([
      db.select().from(suppliers),
      db.select().from(fabricTypes),
      db.select().from(users)
    ]);
    return { suppliers: s, fabricTypes: f, inspectors: u };
  } catch (error) {
    console.error("Gagal ambil data form:", error);
    return { suppliers: [], fabricTypes: [], inspectors: [] };
  }
}

/**
 * 2. CREATE ORDER
 */
export async function createFullOrder(data: {
  supplierId: string;
  qcUserId1?: string;
  qcUserId2?: string;
  qcUserId3?: string;
  keteranganHeader?: string;
  items: Array<{
    fabricTypeId: string;
    kategori: "polosan" | "printing";
    warnaAtauDesain: string;
    totalYardOrder: string;
    totalMeterOrder: string;
    imageUrl?: string;
  }>;
}) {
  try {
    const newOrder = await db.insert(orders).values({
      supplierId: parseInt(data.supplierId),
      qcUserId1: data.qcUserId1 ? parseInt(data.qcUserId1) : null,
      qcUserId2: data.qcUserId2 ? parseInt(data.qcUserId2) : null,
      qcUserId3: data.qcUserId3 ? parseInt(data.qcUserId3) : null,
      keterangan: data.keteranganHeader
    }).returning({ id: orders.id });

    const orderId = newOrder[0].id;

    if (data.items && data.items.length > 0) {
      const itemsToInsert = await Promise.all(
        data.items.map(async (item) => {
          let finalImageUrl = item.imageUrl || null;

          if (finalImageUrl && finalImageUrl.startsWith("data:image")) {
            finalImageUrl = await uploadFabricImage(finalImageUrl, "foto_kain.jpg");
          }

          return {
            orderId: orderId,
            fabricTypeId: parseInt(item.fabricTypeId),
            kategori: item.kategori as "polosan" | "printing",
            warnaAtauDesain: item.warnaAtauDesain,
            totalYardOrder: parseFloat(item.totalYardOrder),
            totalMeterOrder: parseFloat(item.totalMeterOrder),
            imageUrl: finalImageUrl,
            maxPointGradeA: 20, 
            maxPointGradeB: 40,
            maxPointGradeC: 60,
          };
        })
      );

      await db.insert(orderItems).values(itemsToInsert);
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("Create Order Error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 3. UPDATE ORDER
 */
export async function updateOrderAction(id: number, data: any) {
  try {
    await db.update(orders)
      .set({
        supplierId: parseInt(data.supplierId),
        qcUserId1: data.qcUserId1 ? parseInt(data.qcUserId1) : null,
        qcUserId2: data.qcUserId2 ? parseInt(data.qcUserId2) : null,
        qcUserId3: data.qcUserId3 ? parseInt(data.qcUserId3) : null,
        keterangan: data.keteranganHeader,
      })
      .where(eq(orders.id, id));

    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    
    if (data.items && data.items.length > 0) {
        const itemsToInsert = await Promise.all(
          data.items.map(async (item: any) => {
            let finalImageUrl = item.imageUrl || null;

            if (finalImageUrl && finalImageUrl.startsWith("data:image")) {
              finalImageUrl = await uploadFabricImage(finalImageUrl, "edit_kain.jpg");
            }

            return {
              orderId: id,
              fabricTypeId: parseInt(item.fabricTypeId),
              kategori: item.kategori,
              warnaAtauDesain: item.warnaAtauDesain,
              totalYardOrder: parseFloat(item.totalYardOrder),
              totalMeterOrder: parseFloat(item.totalMeterOrder),
              imageUrl: finalImageUrl,
              maxPointGradeA: 20, 
              maxPointGradeB: 40,
              maxPointGradeC: 60,
            };
          })
        );
        
        await db.insert(orderItems).values(itemsToInsert);
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("Update Order Error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 4. LIST ORDER
 */
export async function getOrdersList() {
  try {
    return await db.query.orders.findMany({
      with: {
        supplier: true,
        items: {
          with: {
            fabricType: true
          }
        },
        qc1: true,
        qc2: true,
        qc3: true
      },
      orderBy: (orders, { desc }) => [desc(orders.tanggalOrder)],
    });
  } catch (error) {
    console.error("Gagal ambil daftar order:", error);
    return [];
  }
}

/**
 * 5. DELETE ORDER
 */
export async function deleteOrderAction(id: number) {
  try {
    await db.delete(orders).where(eq(orders.id, id));
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Order Error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 6. GET ORDER WITH INSPECTIONS
 */
export async function getOrderWithInspections(id: number) {
  try {
    const data = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, id),
      with: {
        order: {
          with: {
            supplier: true,
          }
        },
        fabricType: true,
      }
    });
    return data;
  } catch (error) {
    console.error("Gagal mengambil detail order dengan inspeksi:", error);
    return null;
  }
}

/**
 * 7. GET INSPECTION HISTORY
 */
export async function getInspectionsHistory(orderItemId: number) {
  try {
    const data = await db.select()
      .from(inspections)
      .where(eq(inspections.orderItemId, orderItemId))
      .orderBy(desc(inspections.tanggalInspeksi));
    
    return data.map((insp: any) => ({
      id: insp.id,
      rollNumber: insp.nomorPiece, 
      yardInspected: insp.panjangYardAktual || 0,
      totalPoints: insp.totalPoints || 0,
      grade: insp.grade || 'A',
      tanggal: insp.tanggalInspeksi,
    }));
  } catch (error) {
    console.error("Gagal mengambil riwayat inspeksi:", error);
    return [];
  }
}

/**
 * 8. CREATE NEW INSPECTION RECORD
 */
export async function createInspectionRecord(formData: FormData) {
  try {
    console.log("\n--- [DEBUG] DATA MENTAH DARI FORM FRONTEND ---");
    const rawData = Object.fromEntries(formData.entries());
    console.log(rawData);
    console.log("----------------------------------------------\n");

    const rawOrderItemId = formData.get("orderItemId");
    const rawGrade = formData.get("grade") as string;

    if (!rawOrderItemId) {
      return { success: false, message: "Gagal: orderItemId tidak ditemukan dari form!" };
    }

    const orderItemId = parseInt(rawOrderItemId as string);

    const validGrades = ["A", "B", "C", "Reject"];
    const grade = validGrades.includes(rawGrade) ? rawGrade : "Reject"; 

    const safeParseFloat = (key: string) => {
      const val = formData.get(key);
      if (!val) return 0;
      const parsed = parseFloat(val as string);
      return isNaN(parsed) ? 0 : parsed;
    };

    const safeParseInt = (key: string) => {
      const val = formData.get(key);
      if (!val) return 0;
      const parsed = parseInt(val as string);
      return isNaN(parsed) ? 0 : parsed;
    };

    const dataToInsert = {
      orderItemId,
      nomorPiece: (formData.get("rollNumber") as string) || "",
      catatanInspector: (formData.get("notes") as string) || "",
      grade: grade as any, 
      inspectorId: null, 
      
      panjangYardAktual: safeParseFloat("yardInspected"),
      totalPoints: safeParseInt("totalPoints"),
      
      panjangMeterAktual: safeParseFloat("panjangMeterAktual"),
      lebarAktual: safeParseFloat("lebarAktual"),
      beratAktual: safeParseFloat("beratAktual"),
      gsmKiriAktual: safeParseFloat("gsmKiriAktual"),
      gsmTengahAktual: safeParseFloat("gsmTengahAktual"),
      gsmKananAktual: safeParseFloat("gsmKananAktual"),
      bowingAktual: safeParseFloat("bowingAktual"),
      skewingAktual: safeParseFloat("skewingAktual"),
      pointsPer100Sqy: safeParseFloat("pointsPer100Sqy"),
      keteranganPimpinan: (formData.get("keteranganPimpinan") as string) || "",
    };

    console.log("--- [DEBUG] DATA SIAP DI-INSERT KE DB ---");
    console.log(dataToInsert);

    await db.insert(inspections).values(dataToInsert);

    revalidatePath(`/inspector/check/${orderItemId}`);
    return { success: true };

  } catch (error: any) {
    console.error("\n--- DEBUG ERROR POSTGRES ---");
    
    if (error.code === '23505') {
      return { success: false, message: "Gagal: Nomor Piece ini sudah terdaftar." };
    }
    
    if (error.code === '23502') { 
      return { success: false, message: "Gagal: Ada kolom database wajib (NOT NULL) yang kosong." };
    }

    if (error.code === '42703') {
      return { success: false, message: "Gagal: Database belum dimigrasi (Kolom belum tersedia di PostgreSQL)." };
    }
    
    console.error("Pesan Error Lengkap:", error.message);
    return { success: false, message: `Gagal menyimpan data: ${error.message}` };
  }
}

/**
 * 9. DELETE INSPECTION RECORD
 */
export async function deleteInspectionRecord(inspectionId: number, orderItemId: number) {
  try {
    await db.delete(inspections).where(eq(inspections.id, inspectionId));
    revalidatePath(`/inspector/check/${orderItemId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus inspeksi:", error);
    return { success: false, message: "Gagal menghapus data" };
  }
}

export async function getInspectionDetail(inspectionId: number) {
  try {
    const data = await db.query.inspections.findFirst({
      where: (table, { eq }) => eq(table.id, inspectionId),
    });
    return data;
  } catch (error) {
    console.error("Gagal mengambil detail inspeksi:", error);
    return null;
  }
}

export async function updateInspectionRecord(inspectionId: number, payload: any) {
  try {
    const { defects, ...dataToUpdate } = payload;
    
    await db.update(inspections)
      .set(dataToUpdate)
      .where(eq(inspections.id, inspectionId));

    return { success: true };
  } catch (error: any) {
    console.error("Gagal update inspeksi:", error.message);
    return { success: false, message: `Gagal update data: ${error.message}` };
  }
}