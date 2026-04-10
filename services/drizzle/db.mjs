import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

for (const fileName of [".env.local", ".env"]) {
  const filePath = resolve(process.cwd(), fileName);

  if (existsSync(filePath) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(filePath);
  }
}

const globalForSeedDb = globalThis;

export const pool =
  globalForSeedDb.__seedPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/my_app",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

export const db = globalForSeedDb.__seedDb ?? drizzle(pool);

if (process.env.NODE_ENV !== "production") {
  globalForSeedDb.__seedPool = pool;
  globalForSeedDb.__seedDb = db;
}
