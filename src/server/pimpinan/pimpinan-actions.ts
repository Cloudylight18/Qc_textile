"use server"
import { db } from "@/db";
import { inspections, orders, defects } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function getPimpinanReport() {
  try {
    // 1. Hitung distribusi Grade (A, B, C, Reject)
    const gradeDist = await db.select({
      grade: inspections.grade,
      count: sql<number>`count(*)`,
    })
    .from(inspections)
    .groupBy(inspections.grade);

    // 2. Ambil 5 jenis defect yang paling sering muncul (Top Issues)
    const topDefects = await db.select({
      jenis: defects.jenisDefect,
      total: sql<number>`count(*)`,
    })
    .from(defects)
    .groupBy(defects.jenisDefect)
    .orderBy(sql`count(*) desc`)
    .limit(5);

    // 3. Ambil rata-rata Point per 100 Sqy (Kualitas kain keseluruhan)
    const avgQuality = await db.select({
      avgPoint: sql<number>`avg(${inspections.pointsPer100Sqy})`
    }).from(inspections);

    return {
      gradeDist,
      topDefects,
      avgQuality: avgQuality[0]?.avgPoint || 0
    };
  } catch (error) {
    console.error("Gagal ambil laporan pimpinan:", error);
    return null;
  }
}