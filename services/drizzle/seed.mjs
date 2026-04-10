import { pool } from "./db.mjs";
import { MINIMUM_ROWS_PER_TABLE } from "./seed/config.mjs";
import { createBorrowers } from "./seed/borrowers.mjs";
import { createToolTransactions } from "./seed/tool-transactions.mjs";
import { createTools } from "./seed/tools.mjs";
import { ensureRequiredTablesExist, getCounts, loadEnvFiles } from "./utils.mjs";

async function main() {
  loadEnvFiles();

  console.log("Starting database seed...");
  await ensureRequiredTablesExist();

  const initialCounts = await getCounts();

  const insertedBorrowers = await createBorrowers(
    Math.max(0, MINIMUM_ROWS_PER_TABLE - initialCounts.borrowers),
    "registry",
  );
  const insertedTools = await createTools(
    Math.max(0, MINIMUM_ROWS_PER_TABLE - initialCounts.tools),
    "catalog",
  );

  const missingTransactionCount = Math.max(0, MINIMUM_ROWS_PER_TABLE - initialCounts.toolTransactions);
  let seededTransactions = 0;

  if (missingTransactionCount > 0) {
    const requiredTransactionTools = Math.max(1, Math.ceil(missingTransactionCount / 2));
    const requiredTransactionBorrowers = Math.max(
      1,
      Math.min(requiredTransactionTools, Math.ceil(missingTransactionCount / 3)),
    );

    const transactionBorrowers =
      insertedBorrowers.length >= requiredTransactionBorrowers
        ? insertedBorrowers.slice(0, requiredTransactionBorrowers)
        : insertedBorrowers.concat(
            await createBorrowers(requiredTransactionBorrowers - insertedBorrowers.length, "transactions"),
          );

    const transactionTools =
      insertedTools.length >= requiredTransactionTools
        ? insertedTools.slice(0, requiredTransactionTools)
        : insertedTools.concat(await createTools(requiredTransactionTools - insertedTools.length, "transactions"));

    seededTransactions = await createToolTransactions(
      missingTransactionCount,
      transactionTools,
      transactionBorrowers,
    );
  }

  const finalCounts = await getCounts();

  console.log("Database seed completed.");
  console.log(`Borrowers: ${initialCounts.borrowers} -> ${finalCounts.borrowers}`);
  console.log(`Tools: ${initialCounts.tools} -> ${finalCounts.tools}`);
  console.log(`Tool transactions: ${initialCounts.toolTransactions} -> ${finalCounts.toolTransactions}`);
  console.log(`Inserted borrowers: ${Math.max(0, finalCounts.borrowers - initialCounts.borrowers)}`);
  console.log(`Inserted tools: ${Math.max(0, finalCounts.tools - initialCounts.tools)}`);
  console.log(`Inserted transactions: ${seededTransactions}`);
}

void main()
  .catch((error) => {
    console.error("Database seeding failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
