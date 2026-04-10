import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "drizzle-kit";

for (const fileName of [".env.local", ".env"]) {
  const filePath = resolve(process.cwd(), fileName);

  if (existsSync(filePath) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(filePath);
  }
}

export default defineConfig({
  schema: "./core/db/schema/index.ts",
  out: "./core/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: false,
  verbose: false,
});
