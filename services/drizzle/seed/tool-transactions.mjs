import { eq } from "drizzle-orm";

import { db } from "../db.mjs";
import { toolTransactions, tools } from "../schema/index.mjs";
import { daysAgo, hoursAfter } from "../utils.mjs";
import { SINGLE_BORROW_STATUSES } from "./config.mjs";

export async function createToolTransactions(count, toolPool, borrowerPool) {
  if (count <= 0) {
    return 0;
  }

  if (toolPool.length === 0 || borrowerPool.length === 0) {
    throw new Error("Seed transactions require at least one tool and one borrower.");
  }

  const transactionsToInsert = [];
  const toolStatusUpdates = new Map();

  for (let toolIndex = 0; transactionsToInsert.length < count; toolIndex += 1) {
    const tool = toolPool[toolIndex % toolPool.length];
    const borrower = borrowerPool[toolIndex % borrowerPool.length];
    const borrowedAt = daysAgo(60 - toolIndex * 2, 8 + (toolIndex % 7));

    transactionsToInsert.push({
      toolId: tool.id,
      borrowerId: borrower.id,
      borrowerName: borrower.name,
      transactionType: "borrowed",
      recordedAt: borrowedAt,
      notes: "Seeded borrow transaction for analytics and log testing.",
    });

    let finalStatus = SINGLE_BORROW_STATUSES[toolIndex % SINGLE_BORROW_STATUSES.length];
    let finalUpdatedAt = borrowedAt;

    if (transactionsToInsert.length < count && toolIndex % 2 === 0) {
      const returnedAt = hoursAfter(borrowedAt, 6 + (toolIndex % 5));

      transactionsToInsert.push({
        toolId: tool.id,
        borrowerId: borrower.id,
        borrowerName: borrower.name,
        transactionType: "returned",
        recordedAt: returnedAt,
        notes: "Seeded return transaction paired with the borrow record.",
      });

      finalStatus = "available";
      finalUpdatedAt = returnedAt;
    }

    toolStatusUpdates.set(tool.id, {
      status: finalStatus,
      updatedAt: finalUpdatedAt,
    });
  }

  await db.insert(toolTransactions).values(transactionsToInsert);

  await Promise.all(
    Array.from(toolStatusUpdates.entries()).map(([toolId, update]) =>
      db
        .update(tools)
        .set({
          currentStatus: update.status,
          updatedAt: update.updatedAt,
        })
        .where(eq(tools.id, toolId)),
    ),
  );

  return transactionsToInsert.length;
}
