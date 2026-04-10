import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { db, pool } from "./db.mjs";
import { borrowers, toolTransactions, tools } from "./schema/index.mjs";

export function loadEnvFiles() {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = resolve(process.cwd(), fileName);

    if (existsSync(filePath) && typeof process.loadEnvFile === "function") {
      process.loadEnvFile(filePath);
    }
  }
}

export function toIsoDateSegment(date = new Date()) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export function padNumber(value, length = 4) {
  return String(value).padStart(length, "0");
}

export function daysAgo(days, hour = 9) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

export function hoursAfter(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function getCounts() {
  const [allBorrowers, allTools, allTransactions] = await Promise.all([
    db.select({ id: borrowers.id }).from(borrowers),
    db.select({ id: tools.id }).from(tools),
    db.select({ id: toolTransactions.id }).from(toolTransactions),
  ]);

  return {
    borrowers: allBorrowers.length,
    tools: allTools.length,
    toolTransactions: allTransactions.length,
  };
}

export async function ensureRequiredTablesExist() {
  const requiredTables = ["borrowers", "tools", "tool_transactions"];
  const result = await pool.query(
    `
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name = any($1::text[])
    `,
    [requiredTables],
  );

  const existingTables = new Set(result.rows.map((row) => row.table_name));
  const missingTables = requiredTables.filter((tableName) => !existingTables.has(tableName));

  if (missingTables.length > 0) {
    const tableLabel = missingTables.join(", ");
    throw new Error(
      `Missing database tables: ${tableLabel}. Run "pnpm db:push" first, then run "pnpm db:seed" again.`,
    );
  }
}
