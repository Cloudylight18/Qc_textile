// lib/hashids.ts
import Hashids from 'hashids';

// Salt rahasia untuk mengacak ID (bisa disesuaikan dengan JWT_SECRET Anda)
const hashids = new Hashids(
  process.env.JWT_SECRET || 'dewa-sutratex-secure-salt-2026', 
  10 // Panjang minimal karakter hasil enkripsi URL
);

// Mengubah ID angka menjadi string acak (Contoh: 10 -> "bV2x9Kp1L3")
export function encodeId(id: number): string {
  return hashids.encode(id);
}

// Mengubah kembali string acak di URL menjadi angka ID asli (Contoh: "bV2x9Kp1L3" -> 10)
export function decodeId(hash: string): number {
  try {
    const decoded = hashids.decode(hash);
    return decoded.length > 0 ? Number(decoded[0]) : 0;
  } catch (e) {
    return 0;
  }
}