"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { db } from "@/db";
import { defects } from "@/db/schema";
import { sql } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeDefectWithMasterData(base64Image: string) {
  try {
    // 1. Ambil "Bank Data" dari database
    // Kita batasi hanya ambil kolom yang relevan untuk menghemat token
    const defectList = await db.select({
      kode: defects.kodeDefect,
      nama: defects.jenisDefect,
    }).from(defects);
    
    // Jika database kosong, berikan array kosong agar prompt tidak error
    if (defectList.length === 0) {
      throw new Error("Master data defect kosong, silakan isi database terlebih dahulu.");
    }

    const daftarKatalog = defectList.map(
      (d) => `- [KODE: ${d.kode}] - [NAMA: ${d.nama}] - [KATEGORI: ${d.kategori}]`
    ).join("\n");

    const base64Data = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

    // 2. Prompt Engineering yang lebih ketat
    const prompt = `
      Anda adalah Inspector Quality Control Tekstil. 
      Tugas Anda adalah menganalisis foto kain dan menentukan jenis cacat berdasarkan KATALOG CACAT RESMI pabrik.

      KATALOG CACAT RESMI:
      ${daftarKatalog}

      INSTRUKSI:
      1. Analisis gambar dengan teliti.
      2. Cocokkan hasil analisis Anda HANYA dengan item yang ada di KATALOG CACAT RESMI.
      3. Pilih satu yang paling mendekati secara visual.
      4. Jika cacat TIDAK ADA di katalog, berikan nama sesuai analisis Anda sendiri tetapi tandai kode_defect_terpilih dengan "NEW_DEFECT".
      5. Jangan memberikan opini di luar format JSON.
    `;

    // 3. Panggil Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kode_defect_terpilih: { 
              type: Type.STRING, 
              description: "Ambil persis dari bagian KODE di katalog. Jika baru, tulis 'NEW_DEFECT'" 
            },
            nama_defect_terpilih: { type: Type.STRING },
            tingkat_keyakinan: { type: Type.NUMBER, description: "Angka persentase 1-100" },
            alasan_singkat: { type: Type.STRING, description: "Alasan mengapa memilih defect ini" }
          },
          required: ["kode_defect_terpilih", "nama_defect_terpilih", "tingkat_keyakinan", "alasan_singkat"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("AI tidak mengembalikan respon");
    
    const parsedData = JSON.parse(resultText);

    return { 
      success: true, 
      data: parsedData,
      source: "gemini_ai" // Informasi sumber
    };

  } catch (error) {
    console.error("Gemini AI Error:", error);
    
    // 4. Otomatisasi Fallback: 
    // Jika API AI Error (Limit/Token), jangan buat user bingung. 
    // Berikan respons gagal yang jelas.
    return { 
      success: false, 
      message: "Gagal menganalisis gambar. Sistem AI sedang sibuk atau key expired.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}