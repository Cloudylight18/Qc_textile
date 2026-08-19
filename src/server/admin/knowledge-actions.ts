"use server";

import { db } from "@/db";
import { knowledgeBase } from "@/db/schema";
import { eq, desc, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Ambil Semua Data Knowledge
export async function getKnowledgeList(query?: string) {
  try {
    if (query) {
      return await db.select().from(knowledgeBase)
        .where(ilike(knowledgeBase.term, `%${query}%`))
        .orderBy(desc(knowledgeBase.id));
    }
    return await db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.id));
  } catch (error) {
    console.error("Gagal ambil knowledge:", error);
    return [];
  }
}

// 2. Tambah Data oleh Admin
export async function addKnowledgeItem(formData: FormData) {
  try {
    const term = formData.get("term") as string;
    const description = formData.get("description") as string;

    if (!term || !description) return { success: false, error: "Semua kolom wajib diisi!" };

    await db.insert(knowledgeBase).values({ term, description });
    
    // Refresh semua route yang menggunakan komponen ini
    revalidatePath("/admin/knowledge");
    revalidatePath("/inspector", "layout");
    revalidatePath("/pimpinan", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal tambah knowledge:", error);
    return { success: false, error: "Gagal menyimpan ke database." };
  }
}

// 3. Hapus Data oleh Admin
export async function deleteKnowledgeItem(id: number) {
  try {
    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
    revalidatePath("/admin/knowledge");
    revalidatePath("/inspector", "layout");
    revalidatePath("/pimpinan", "layout");
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus knowledge:", error);
    return { success: false, error: "Gagal menghapus data." };
  }
}

// 4. AI Bot Assistant dengan Multi-Model & Smart Local Fallback
export async function askKnowledgeBot(userQuestion: string) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash"];
  let responseText = null;

  for (const modelName of modelsToTry) {
    try {
      const allData = await db.select().from(knowledgeBase);
      const contextText = allData.map(k => `- ${k.term}:\n${k.description}`).join("\n\n");

      const prompt = `
        Anda adalah TANYA (Asisten AI Pabrik Tekstil Dewa Sutratex).
        Berikut adalah panduan resmi pabrik kami:
        ${contextText}

        Pertanyaan User: "${userQuestion}"

        Instruksi: 
        1. Jawab ramah, profesional, dan to-the-point.
        2. Gunakan data dari panduan di atas. Jika tidak ada di panduan, jelaskan dengan standar tekstil umum dan sarankan hubungi supervisor.
      `;

      const response = await ai.models.generateContent({
        model: modelName, 
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      if (response.text) {
        responseText = response.text;
        break; 
      }
    } catch (aiError: any) {
      console.warn(`⚠️ Model ${modelName} sibuk/gagal.`);
    }
  }

  // Smart Fallback jika server Google down
  if (!responseText) {
    try {
      const results = await db.select().from(knowledgeBase);
      const cleanQuery = userQuestion.toLowerCase();
      const matched = results.find(item => 
        cleanQuery.includes(item.term.toLowerCase()) || 
        item.term.toLowerCase().includes(cleanQuery.replace(/apa itu|pengertian|artinya|\?/g, "").trim())
      );

      if (matched) {
        return { 
          success: true, 
          answer: `📌 [Mode Offline]\n\n**${matched.term}**\n${matched.description}` 
        };
      }
      return { 
        success: true, 
        answer: `⚠️ Sistem AI sedang antre panjang. Panduan untuk pertanyaan Anda belum ditemukan di database offline. Silakan coba sebentar lagi.` 
      };
    } catch (dbError) {
      return { success: false, answer: "Sistem gangguan." };
    }
  }

  return { success: true, answer: responseText };
}

// 5. Update Data oleh Admin (Fungsi Baru untuk Edit)
export async function updateKnowledgeItem(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    const term = formData.get("term") as string;
    const description = formData.get("description") as string;

    if (!id || !term || !description) {
      return { success: false, error: "Semua kolom wajib diisi!" };
    }

    await db.update(knowledgeBase)
      .set({ term, description })
      .where(eq(knowledgeBase.id, id));
    
    // Refresh semua route agar data terbaru langsung muncul
    revalidatePath("/admin/knowledge");
    revalidatePath("/inspector", "layout");
    revalidatePath("/pimpinan", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal update knowledge:", error);
    return { success: false, error: "Gagal mengupdate database." };
  }
}