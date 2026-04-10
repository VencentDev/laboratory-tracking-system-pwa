import { db } from "./db.mjs";
import { borrowers, toolTransactions, tools } from "./schema/index.mjs";

export async function resetSeedTables() {
  console.log("Cleaning up inventory seed tables...");

  await db.delete(toolTransactions);
  await db.delete(tools);
  await db.delete(borrowers);

  console.log("Inventory seed tables cleared.");
}
