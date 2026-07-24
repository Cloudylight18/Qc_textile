// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   schema: "./src/db/schema.ts",
//   out: "./drizzle",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: "postgresql://postgres:admin123@localhost:5432/qc_textile_db",
//   },
// });

import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Paksa baca dari .env
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, 
  },
});