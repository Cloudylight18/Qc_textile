"use server";

// Sesuaikan path import di bawah dengan lokasi file koneksi db dan schema Drizzle Anda
import { db } from "@/db"; 
import { orders, fabricTypes, orderItems } from "@/db/schema"; 
import { count, isNull } from "drizzle-orm";

export interface DashboardStats {
  totalOrders: number;
  activeFabrics: number;
  pendingQC: number;
}

export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    
    const [totalOrdersRes, activeFabricsRes, pendingQcRes] = await Promise.all([
      db.select({ value: count() }).from(orders),
      db.select({ value: count() }).from(fabricTypes),
      db.select({ value: count() })
        .from(orderItems)
        .where(isNull(orderItems.finalGrade)),
    ]);

    return {
      success: true,
      data: {
        totalOrders: totalOrdersRes[0].value,
        activeFabrics: activeFabricsRes[0].value,
        pendingQC: pendingQcRes[0].value,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Gagal mengambil data statistik dari database.",
    };
  }
}