"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-jika-env-kosong-12345'
);

// Helper aman untuk mendeteksi error redirect Next.js
function isRedirectError(error: any): boolean {
  return typeof error?.digest === 'string' && error.digest.includes('NEXT_REDIRECT');
}

// FUNGSI UNTUK MENGAMBIL DATA USER YANG SEDANG LOGIN (SESSION) SECARA REAL-TIME
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const verified = await jwtVerify(token, SECRET_KEY);
    const userId = (verified.payload as any).id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return user || null;
  } catch (error) {
    return null;
  }
}

// 1. FUNGSI LOGIN (AUTHENTICATION - SECURED WITH JWT & FAST REDIRECT)
export async function loginAction(formData: FormData) {
  const username = (formData.get("username") as string).trim();
  const password = (formData.get("password") as string).trim();

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user || !(await bcrypt.compare(password, user.password || ""))) {
      return { error: "Username atau Password salah!" };
    }

    // Generate JWT Encrypted Token
    const token = await new SignJWT({ 
      id: user.id, 
      role: user.role, 
      username: user.username 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Expire dalam 24 Jam
      .sign(SECRET_KEY);

    const cookieStore = await cookies();
    
    // Simpan token dengan level keamanan tertinggi
    cookieStore.set("auth_token", token, { 
      path: "/", 
      maxAge: 24 * 60 * 60, // 24 Jam
      httpOnly: true, // Cegah akses cookie dari JavaScript (Anti-XSS)
      secure: process.env.NODE_ENV === "production", // Wajib HTTPS di production
      sameSite: 'strict'
    });
    
    // Cookie non-sensitif untuk UI (Opsional)
    cookieStore.set("user_name", user.username as string, { path: "/", maxAge: 24 * 60 * 60 });

    // Arahkan ke rute yang tepat berdasarkan Role
    let redirectPath = "/inspector"; 
    if (user.role === 'admin') redirectPath = "/admin/dashboard";
    if (user.role === 'pimpinan') redirectPath = "/pimpinan/dashboard";

    redirect(redirectPath);

  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan pada server saat login." };
  }
}

// 2. FUNGSI REGISTER
export async function registerUserAction(formData: FormData) {
  const nama = (formData.get("nama") as string)?.trim();
  const username = (formData.get("username") as string).trim();
  const password = (formData.get("password") as string).trim();
  const role = formData.get("role") as string;
  const fotoProfil = formData.get("fotoProfil") as string; // Opsional

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
      fotoProfil: fotoProfil || null,
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal mendaftarkan user." };
  }
}

// 3. FUNGSI UPDATE USER (OLEH ADMIN DARI HALAMAN USERS)
export async function updateUserAction(id: number, formData: FormData) {
  const nama = (formData.get("nama") as string).trim();
  const role = formData.get("role") as string;
  const username = (formData.get("username") as string)?.trim();
  const rawPassword = formData.get("password") as string;

  try {
    const updateData: any = { nama, role: role as any };
    if (username) updateData.username = username;
    
    // Jika password diisi, update passwordnya
    if (rawPassword && rawPassword.trim() !== "") {
       const salt = await bcrypt.genSalt(10);
       updateData.password = await bcrypt.hash(rawPassword.trim(), salt);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));
    
    revalidatePath("/admin/users");
    revalidatePath("/inspector/pengaturan");
    revalidatePath("/pimpinan/pengaturan");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal memperbarui data." };
  }
}

// 4. FUNGSI PENGATURAN PROFIL (SETTINGS) - AMBIL ID OTOMATIS DARI COOKIE JWT
export async function updateProfileSettingsAction(payload: {
  name: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
  fotoProfil?: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "⚠️ Sesi login habis, silakan login ulang." };
    }

    const verified = await jwtVerify(token, SECRET_KEY);
    const userId = (verified.payload as any).id;

    const { name, username, currentPassword, newPassword, fotoProfil } = payload;

    const existingUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!existingUser) {
      return { success: false, message: "User tidak ditemukan!" };
    }

    const userRole = existingUser.role;

    // CEK PEMBATASAN 2 KALI SEHARI (Khusus Inspector & Pimpinan)
    if (userRole === 'inspector' || userRole === 'pimpinan') {
      const todayStr = new Date().toDateString();
      const lastUpdateStr = existingUser.lastProfileUpdate ? new Date(existingUser.lastProfileUpdate).toDateString() : "";

      let currentCount = existingUser.updateCountToday || 0;

      if (lastUpdateStr !== todayStr) {
        currentCount = 0; // Reset jika hari sudah berganti
      }

      if (currentCount >= 2) {
        return { 
          success: false, 
          message: "⚠️ Batas maksimal update profil adalah 2 kali dalam sehari." 
        };
      }

      await db.update(users).set({
        updateCountToday: currentCount + 1,
        lastProfileUpdate: new Date(),
      }).where(eq(users.id, userId));
    }

    // SIAPKAN DATA UPDATE
    const updateData: any = { nama: name };
    if (fotoProfil !== undefined) updateData.fotoProfil = fotoProfil;

    if (userRole === 'admin') {
      if (username) updateData.username = username;
      if (newPassword && currentPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password || "");
        if (!isPasswordValid) {
          return { success: false, message: "Password saat ini salah!" };
        }
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(newPassword, salt);
      }
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    revalidatePath("/admin/users");
    revalidatePath("/admin/pengaturan");
    revalidatePath("/inspector/pengaturan");
    revalidatePath("/pimpinan/pengaturan");
    revalidatePath("/", "layout");

    return { success: true, message: "✅ Profil berhasil diperbarui!" };

  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Gagal memperbarui profil pada server." };
  }
}

// 5. FUNGSI DELETE USER
export async function deleteUserAction(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menghapus user." };
  }
}

// 6. FUNGSI LOGOUT
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("user_name");
    redirect("/login");
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    redirect("/login");
  }
}