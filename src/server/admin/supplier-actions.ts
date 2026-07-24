"use server";

import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * ACTION: CREATE SUPPLIER
 * Menambahkan data pabrik/vendor baru ke database
 */
export async function createSupplierAction(formData: FormData) {
  try {
    const namaPerusahaan = formData.get("namaPerusahaan") as string;
    const pic = formData.get("pic") as string;
    const kontak = formData.get("kontak") as string;
    const alamat = formData.get("alamat") as string;

    // Validasi sederhana
    if (!namaPerusahaan || !kontak || !alamat) {
      return { success: false, message: "Nama, Kontak, dan Alamat wajib diisi!" };
    }

    await db.insert(suppliers).values({
      namaPerusahaan,
      pic,
      kontak,
      alamat,
    });

    // Refresh data di halaman master supplier
    revalidatePath("/admin/master/suppliers");
    
    return { success: true, message: "Supplier berhasil didaftarkan!" };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, message: "Gagal menambahkan supplier." };
  }
}

/**
 * ACTION: UPDATE SUPPLIER
 * Memperbarui data supplier yang sudah ada berdasarkan ID
 */
export async function updateSupplierAction(id: string | number, formData: FormData) {
  try {
    const namaPerusahaan = formData.get("namaPerusahaan") as string;
    const pic = formData.get("pic") as string;
    const kontak = formData.get("kontak") as string;
    const alamat = formData.get("alamat") as string;

    if (!id) return { success: false, message: "ID Supplier tidak ditemukan." };

    await db.update(suppliers)
      .set({
        namaPerusahaan,
        pic,
        kontak,
        alamat,
      })
      .where(eq(suppliers.id, Number(id)));

    // Refresh data agar perubahan langsung terlihat
    revalidatePath("/admin/master/suppliers");
    
    return { success: true, message: "Data supplier berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { success: false, message: "Gagal memperbarui data supplier." };
  }
}

/**
 * ACTION: DELETE SUPPLIER
 * Menghapus data supplier dari database
 */
export async function deleteSupplierAction(id: string | number) {
  try {
    if (!id) return { success: false, message: "ID tidak valid." };

    await db.delete(suppliers).where(eq(suppliers.id, Number(id)));

    // Refresh halaman setelah hapus
    revalidatePath("/admin/master/suppliers");

    return { success: true, message: "Supplier berhasil dihapus." };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, message: "Gagal menghapus data supplier." };
  }
}