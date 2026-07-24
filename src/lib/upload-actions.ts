"use server"
import fs from 'fs/promises';
import path from 'path';

export async function saveFileLocally(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. Tentukan lokasi folder
  const uploadDir = path.join(process.cwd(), "public/uploads/defects");

  // 2. CEK & BUAT FOLDER JIKA BELUM ADA (Ini solusinya!)
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // 3. Simpan file
  const fileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);
  return `/uploads/defects/${fileName}`;
}