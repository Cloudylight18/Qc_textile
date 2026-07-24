"use server"

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";


//  1. FUNGSI LOGIN (AUTHENTICATION)
 
export async function loginAction(formData: FormData) {
  const username = (formData.get("username") as string).trim();
  const password = (formData.get("password") as string).trim();

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    // Cek user & bandingkan password secara ASYNC (lebih ringan)
    if (!user || !(await bcrypt.compare(password, user.password || ""))) {
      return { error: "Username atau Password salah!" };
    }

    const cookieStore = await cookies();
    const expires = 24 * 60 * 60 * 1000; 
    cookieStore.set("user_role", user.role as string, { path: "/", maxAge: expires, httpOnly: true });
    cookieStore.set("user_name", user.username as string, { path: "/", maxAge: expires });
    redirect(`/${user.role}/dashboard`);

  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: "Terjadi kesalahan pada server." };
  }
}

//2. FUNGSI REGISTER (CREATE)
export async function registerUserAction(formData: FormData) {
  const nama = (formData.get("nama") as string)?.trim();
  const username = (formData.get("username") as string).trim();
  const password = (formData.get("password") as string).trim();
  const role = formData.get("role") as string;

  try {
    const existing = await db.query.users.findFirst({ where: eq(users.username, username) });
    if (existing) return { error: "Username sudah terdaftar!" };
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.insert(users).values({
      nama: nama || username,
      username,
      password: hashedPassword,
      role: role as any,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal mendaftarkan user." };
  }
}


 //3. FUNGSI UPDATE (EDIT)

export async function updateUserAction(id: number, formData: FormData) {
  const nama = (formData.get("nama") as string).trim();
  const role = formData.get("role") as string;

  try {
    await db.update(users)
      .set({ nama, role: role as any })
      .where(eq(users.id, id));
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal memperbarui data." };
  }
}

 //4. FUNGSI DELETE (HAPUS)

export async function deleteUserAction(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menghapus user." };
  }
}

 //5. FUNGSI LOGOUT
 
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user_role");
  cookieStore.delete("user_name");
  redirect("/login");
}