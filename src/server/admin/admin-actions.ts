"use server"

import { db } from "@/db";
import { users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// 1. Fungsi Ambil Data User
export async function getUsers() {
  try {
    return await db.select().from(users).orderBy(users.id);
  } catch (error) {
    console.error("Gagal ambil data:", error);
    return [];
  }
}

// 2. Fungsi Buat User Baru
export async function createUser(data: any) {
  try {
    await db.insert(users).values({
      username: data.username,
      password: data.password, 
      role: data.role,
    });
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Database Error:", error.message);
    return { success: false, message: error.message };
  }
}

// 3. Fungsi Update User (PASTIKAN ADA KATA 'export')
export async function updateUser(id: number, data: any) {
  try {
    await db.update(users)
      .set({
        username: data.username,
        password: data.password,
        role: data.role,
      })
      .where(eq(users.id, id));
      
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal Update:", error.message);
    return { success: false, message: error.message };
  }
}

// 4. Fungsi Hapus User
export async function deleteUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal Hapus:", error);
    return { success: false };
  }
}