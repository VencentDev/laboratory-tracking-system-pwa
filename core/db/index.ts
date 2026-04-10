import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  pool?: Pool;
  db?: ReturnType<typeof drizzle>;
};

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/my_app",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

export const db = globalForDb.db ?? drizzle(pool);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.db = db;
}
