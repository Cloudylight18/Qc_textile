import 'dotenv/config';
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  console.log("=== [SEEDING] MEMULAI PROSES DATA AWAL ===");

  const adminUsername = "admin@gmail.com";
  const hashedPassword = bcrypt.hashSync("admin1234567", 20);

  // 1. Cek apakah admin sudah ada
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.username, adminUsername),
  });

  if (!existingAdmin) {
    console.log("🚀 Admin belum ada, membuat admin default...");
    await db.insert(users).values({
      nama: "Super Admin",
      username: adminUsername,
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Admin default berhasil dibuat!");
  } else {
    console.log("ℹ️ Admin sudah ada, melewati proses.");
  }

  console.log("=== [SEEDING] SELESAI ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ SEEDING GAGAL:", err);
  process.exit(1);
});