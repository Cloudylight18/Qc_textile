"use server";

import { db } from "@/db";
import { inspections, defects, knowledgeBase, users, orderItems, orders, fabricTypes, suppliers } from "@/db/schema";
import { sql, desc, eq, ilike, or } from "drizzle-orm";

export async function getPimpinanReport() {
  try {
    // 1. Ambil rata-rata skor kualitas (points per 100 sqy) dan total roll
    const allInspections = await db.select({
      avgQuality: sql<number>`avg(${inspections.pointsPer100Sqy})`,
      totalRolls: sql<number>`count(${inspections.id})`,
    }).from(inspections);

    const avgQuality = Number(allInspections[0]?.avgQuality || 0);
    const totalRolls = Number(allInspections[0]?.totalRolls || 0);

    // 2. Distribusi Grade (A, B, C, Reject)
    const gradeDistRaw = await db.select({
      grade: inspections.grade,
      count: sql<number>`count(${inspections.id})`,
    })
    .from(inspections)
    .groupBy(inspections.grade);

    const gradeDist = gradeDistRaw.map(g => ({
      grade: g.grade || 'Reject',
      count: Number(g.count)
    }));

    // 3. Top Defect Types (Jenis Cacat Terbanyak)
    const topDefectsRaw = await db.select({
      jenis: defects.jenisDefect,
      total: sql<number>`count(${defects.id})`,
    })
    .from(defects)
    .groupBy(defects.jenisDefect)
    .orderBy(desc(sql`count(${defects.id})`))
    .limit(5);

    const topDefects = topDefectsRaw.map(d => ({
      jenis: d.jenis,
      total: Number(d.total)
    }));

    // 4. DATA EVALUASI INSPECTOR (Jumlah inspeksi & rata-rata skor per inspector)
    const inspectorStatsRaw = await db.select({
      inspectorId: users.id,
      inspectorName: users.nama,
      inspectorUsername: users.username,
      totalInspected: sql<number>`count(${inspections.id})`,
      avgScore: sql<number>`avg(${inspections.pointsPer100Sqy})`,
    })
    .from(inspections)
    .innerJoin(users, eq(inspections.inspectorId, users.id))
    .groupBy(users.id, users.nama, users.username)
    .orderBy(desc(sql`count(${inspections.id})`));

    const inspectorStats = inspectorStatsRaw.map(is => ({
      inspectorId: is.inspectorId,
      inspectorName: is.inspectorName,
      inspectorUsername: is.inspectorUsername,
      totalInspected: Number(is.totalInspected),
      avgScore: Number(is.avgScore || 0)
    }));

    // 5. DETAIL LOG INSPEKSI LENGKAP (Menggunakan Drizzle Relational Queries agar Defects & Warna Kain ikut terbawa)
    const detailedInspectionsRaw = await db.query.inspections.findMany({
      with: {
        inspector: true,
        defects: true,
        orderItem: {
          with: {
            fabricType: true,
            order: {
              with: {
                supplier: true
              }
            }
          }
        }
      },
      orderBy: [desc(inspections.tanggalInspeksi)],
      limit: 50, // Ambil 50 data terbaru agar paginasi 1-6 di frontend berjalan optimal
    });

    const detailedInspections = detailedInspectionsRaw.map(item => ({
      inspectionId: item.id,
      nomorPiece: item.nomorPiece,
      grade: item.grade || 'Reject',
      pointsPer100Sqy: item.pointsPer100Sqy,
      panjangYardAktual: item.panjangYardAktual,
      tanggalInspeksi: item.tanggalInspeksi,
      inspectorId: item.inspectorId || 0,
      inspectorName: item.inspector?.nama || null,
      namaKain: item.orderItem?.fabricType?.namaKain || null,
      warnaAtauDesain: item.orderItem?.warnaAtauDesain || null,
      namaSupplier: item.orderItem?.order?.supplier?.namaPerusahaan || null,
      defects: item.defects.map(d => ({
        jenisDefect: d.jenisDefect,
        poin: d.poin,
        ukuranInci: d.ukuranInci
      }))
    }));

    // KEMBALIKAN DALAM FORMAT FORMAT WRAPPER YANG SESUAI DENGAN DASHBOARD
    return {
      success: true,
      data: {
        avgQuality,
        totalRolls,
        gradeDist,
        topDefects,
        inspectorStats,
        detailedInspections
      }
    };

  } catch (error) {
    console.error("Gagal mengambil laporan pimpinan:", error);
    return {
      success: false,
      data: {
        avgQuality: 0,
        totalRolls: 0,
        gradeDist: [],
        topDefects: [],
        inspectorStats: [],
        detailedInspections: []
      }
    };
  }
}

// --- FUNGSI KNOWLEDGE BASE UNTUK PIMPINAN ---
export async function getKnowledgeBaseTerms(searchQuery?: string) {
  try {
    if (searchQuery && searchQuery.trim() !== "") {
      const results = await db.select()
        .from(knowledgeBase)
        .where(
          or(
            ilike(knowledgeBase.term, `%${searchQuery}%`),
            ilike(knowledgeBase.description, `%${searchQuery}%`)
          )
        )
        .orderBy(knowledgeBase.term);
      return results;
    }
    
    const allTerms = await db.select().from(knowledgeBase).orderBy(knowledgeBase.term);
    return allTerms;
  } catch (error) {
    console.error("Gagal mengambil Knowledge Base:", error);
    return [];
  }
}