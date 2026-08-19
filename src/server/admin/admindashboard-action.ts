"use server";

import { db } from "@/db"; 
import { orders, fabricTypes, orderItems, users, suppliers } from "@/db/schema"; 
import { count, sum, desc, eq } from "drizzle-orm";

export interface DashboardStats {
  totalUsers: number;
  totalSuppliers: number;
  totalFabricTypes: number;
  totalOrders: number;
  totalYardsOrdered: number;
  pendingQC: number;
  recentOrders: Array<{
    id: number;
    supplierName: string;
    tanggalOrder: string | null;
    keterangan: string | null;
    totalYards: number;
  }>;
}

export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    const [
      usersRes,
      suppliersRes,
      fabricTypesRes,
      ordersRes,
      yardsRes,
      pendingQcRes,
      recentOrdersRes
    ] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(suppliers),
      db.select({ value: count() }).from(fabricTypes),
      db.select({ value: count() }).from(orders),
      db.select({ value: sum(orderItems.totalYardOrder) }).from(orderItems),
      db.select({ value: count() }).from(orderItems).where(eq(orderItems.inspectedPercentage, 0)),
      db.query.orders.findMany({
        limit: 15, // Mengambil lebih dari 6 agar fitur scroll bisa aktif jika data banyak
        orderBy: [desc(orders.tanggalOrder)],
        with: {
          supplier: true,
          items: true,
        },
      }),
    ]);

    const formattedRecentOrders = recentOrdersRes.map((order) => {
      const totalYards = order.items.reduce((acc, item) => acc + (item.totalYardOrder || 0), 0);
      return {
        id: order.id,
        supplierName: order.supplier?.namaPerusahaan || "Supplier Tidak Diketahui",
        tanggalOrder: order.tanggalOrder ? new Date(order.tanggalOrder).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
        keterangan: order.keterangan || "Tidak ada keterangan",
        totalYards: totalYards,
      };
    });

    return {
      success: true,
      data: {
        totalUsers: usersRes[0].value,
        totalSuppliers: suppliersRes[0].value,
        totalFabricTypes: fabricTypesRes[0].value,
        totalOrders: ordersRes[0].value,
        totalYardsOrdered: yardsRes[0].value ? Number(yardsRes[0].value) : 0,
        pendingQC: pendingQcRes[0].value,
        recentOrders: formattedRecentOrders,
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