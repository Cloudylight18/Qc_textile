"use server"

import { db } from "@/db";
import { 
  orders, 
  orderItems, 
  fabricTypes, 
  inspections, 
  defects,
} from "@/db/schema"; 
import { eq, or, desc, sql, sum, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  foto?: string; // TAMBAHAN: Agar frontend bisa mengirim foto dari form inspeksi
}

/**
 * Mengambil detail item kain untuk acuan Inspector
 */
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

/**
 * Mengambil daftar order yang ditugaskan kepada inspector.
 */
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

async function analyzeDefectLocalFallback(base64Image: string) {
  console.log("⚠️ Menggunakan Sistem Lokal: Mengakses bank data internal...");
  
  try {
    const topDefect = await db.select({
      jenisDefect: defects.jenisDefect,
      jumlah: count(defects.id)
    })
    .from(defects)
    .groupBy(defects.jenisDefect)
    .orderBy(desc(count(defects.id)))
    .limit(1);

    const fallbackName = topDefect.length > 0 ? topDefect[0].jenisDefect : "Lain-lain / Unidentified";

    return {
      success: true,
      data: {
        namaDefect: fallbackName,
        confidence: 0.50, 
        alasan: "Sistem AI utama sedang offline (limit token). Ini adalah hasil tebakan sistem lokal berdasarkan histori cacat yang paling sering terjadi di pabrik."
      },
      source: "local_database"
    };
  } catch (err) {
    return { success: false, error: "Sistem lokal gagal memproses gambar." };
  }
}

/**
 * LOGIKA UTAMA: Menganalisis gambar menggunakan Gemini, dengan failover ke lokal.
 */
export async function analyzeDefectImage(base64Image: string) {
  console.log(`\n[${new Date().toLocaleTimeString()}] 🚀 [START] Memulai Analisis AI Gemini...`);
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }

    console.log(`[${new Date().toLocaleTimeString()}] 🔍 Mengambil historis defect dari database lokal...`);
    const historicalDefects = await db.select({
      jenisDefect: defects.jenisDefect,
    })
    .from(defects)
    .groupBy(defects.jenisDefect);

    const existingNames = historicalDefects.map(d => d.jenisDefect).join(", ");
    console.log(`[${new Date().toLocaleTimeString()}] 📚 Referensi nama lokal: [${existingNames || "Kosong"}]`);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const mimeTypeMatch = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const promptText = `
      Anda adalah Inspector Quality Control Tekstil Internasional yang sangat berpengalaman.
      
      Tugas Anda:
      1. Analisis gambar kain yang saya lampirkan. Gunakan seluruh pengetahuan Anda tentang standar cacat (defect) tekstil global untuk mengidentifikasi masalah pada kain tersebut.
      2. Berikan nama standar industri untuk cacat tersebut (misalnya: Hole, Slub, Stain, Color Bleeding, Mispick, dll).
      3. Sebagai referensi, ini adalah daftar nama cacat yang sudah pernah digunakan di pabrik kami: [ ${existingNames} ].
         - JIKA cacat di gambar sama dengan salah satu di daftar tersebut, gunakan nama dari daftar agar konsisten.
         - JIKA cacat di gambar adalah jenis BARU yang tidak ada di daftar, berikan nama standar internasional yang paling tepat.
      
      PENTING: Anda hanya boleh merespons menggunakan format JSON yang valid. Formatnya harus seperti ini:
      {
        "namaDefect": "Nama cacat hasil analisis Anda",
        "confidence": 0.95,
        "alasan": "Penjelasan detail mengapa Anda menyimpulkan ini adalah defect tersebut berdasarkan ciri visual pada gambar."
      }
    `;

    console.log(`[${new Date().toLocaleTimeString()}] 📤 Mengirim gambar dan prompt ke server Google...`);
    const result = await model.generateContent([
      promptText,
      {
        inlineData: { data: base64Data, mimeType: mimeType }
      }
    ]);

    const responseText = result.response.text();
    console.log(`[${new Date().toLocaleTimeString()}] 📥 Menerima respon mentah dari Gemini:`, responseText);
    
    const cleanedJsonString = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const aiData = JSON.parse(cleanedJsonString);

    console.log(`[${new Date().toLocaleTimeString()}] ✅ [SUCCESS] Defect terdeteksi: ${aiData.namaDefect} (Confidence: ${aiData.confidence})`);

    return { success: true, data: aiData, source: "gemini_ai" };

  } catch (error: any) {
    console.error(`\n[${new Date().toLocaleTimeString()}] ❌ [ERROR] Gemini API Error / Limit tercapai:`, error.message);
    console.log(`[${new Date().toLocaleTimeString()}] 🔄 Mengalihkan ke sistem fallback lokal...`);
    
    return await analyzeDefectLocalFallback(base64Image);
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

    const newInspection = await db.insert(inspections).values({
      orderItemId: data.orderItemId,
      inspectorId: data.inspectorId,
      nomorPiece: data.noPiece,
      lebarAktual: sql`${data.lebarAktual}`,
      beratAktual: sql`${data.beratAktual}`,
      panjangYardAktual: sql`${data.panjangYard}`,
      panjangMeterAktual: sql`${data.panjangMeter}`,
      bowingAktual: sql`${data.bowing}`,
      skewingAktual: sql`${data.skewing}`,
      keteranganPimpinan: data.keterangan || "",
      
      totalPoints: totalPoin,
      pointsPer100Sqy: sql`${penaltyScore.toFixed(2)}`,
      grade: finalGrade,
    }).returning({ insertedId: inspections.id });

    const inspectionId = newInspection[0].insertedId;

    if (data.defects.length > 0) {
      const defectValues = data.defects.map((d) => ({
        inspectionId: inspectionId,
        jenisDefect: d.nama,
        kodeDefect: d.kodeDefect || null, 
        ukuranInci: d.inci,
        poin: d.point,
        posisiYard: d.yardKe,
        namaSupplier: d.namaSupplier || null, 
        fotoDefectUrl: d.foto || null, // TAMBAHAN: Menyimpan foto ke database
      }));
      
      await db.insert(defects).values(defectValues as any);
    }

    revalidatePath("/inspector/dashboard");
    revalidatePath("/inspector/defect"); // TAMBAHAN: Refresh katalog defect
    
    return { success: true, inspectionId: inspectionId };
  } catch (error) {
    console.error("Gagal inisialisasi inspeksi:", error);
    return { success: false, error: "Gagal membuat data inspeksi." };
  }
}

/**
 * Menyimpan data temuan cacat (defect) secara individu 
 */
export async function submitInspeksi(data: {
  inspectionId: number;
  jenisDefect: string;
  kodeDefect?: string; 
  poin: number;
  posisiYard: number;
  ukuranInci: number;
  namaSupplier?: string; 
}, fotoPath?: string) {
  try {
    await db.insert(defects).values({
      inspectionId: data.inspectionId,
      jenisDefect: data.jenisDefect,
      kodeDefect: data.kodeDefect || null, 
      ukuranInci: data.ukuranInci,
      poin: data.poin,
      posisiYard: data.posisiYard,
      fotoDefectUrl: fotoPath || null,
      namaSupplier: data.namaSupplier || null, 
    } as any);

    await updateAutoKalkulasi(data.inspectionId);
    
    revalidatePath("/inspector");
    revalidatePath("/inspector/defect"); // TAMBAHAN: Refresh katalog defect
    
    return { success: true };
  } catch (error) {
    console.error("Gagal simpan defect:", error);
    return { success: false, error: "Gagal menyimpan ke database" };
  }
}

/**
 * Fungsi Internal: Kalkulasi Ulang 4-Point System
 */
async function updateAutoKalkulasi(inspectionId: number) {
  try {
    const defectResult = await db
      .select({ total: sum(defects.poin) })
      .from(defects)
      .where(eq(defects.inspectionId, inspectionId));

    const totalPoinSekarang = Number(defectResult[0]?.total || 0);

    const infoKain = await db.select({
      lebar: inspections.lebarAktual, 
      totalYard: inspections.panjangYardAktual,
    })
    .from(inspections)
    .where(eq(inspections.id, inspectionId))
    .limit(1);

    if (infoKain.length > 0) {
      const { lebar, totalYard } = infoKain[0];
      const yard = Number(totalYard) || 1;
      const lbr = Number(lebar) || 1;
      
      const pointsPer100Sqy = (totalPoinSekarang * 3600) / (yard * lbr);

      let finalGrade: 'A' | 'B' | 'C' = 'A';
      if (pointsPer100Sqy > 40) finalGrade = 'C';
      else if (pointsPer100Sqy > 20) finalGrade = 'B';

      await db.update(inspections)
        .set({
          totalPoints: totalPoinSekarang,
          pointsPer100Sqy: sql`${pointsPer100Sqy.toFixed(2)}`,
          grade: finalGrade,
        })
        .where(eq(inspections.id, inspectionId));
    }
  } catch (err) {
    console.error("Gagal Update Kalkulasi:", err);
  }
}