import { eq } from "drizzle-orm";

import { db } from "../db.mjs";
import { tools } from "../schema/index.mjs";
import { daysAgo, padNumber } from "../utils.mjs";
import { TOOL_CATEGORIES, TOOL_NAMES } from "./config.mjs";
import { formatToolBarcode } from "../../../features/inventory/lib/barcode.ts";

export async function createTools(count, label) {
  if (count <= 0) {
    return [];
  }

  const toolValues = Array.from({ length: count }, (_, index) => ({
    barcode: `PENDING-SEED-${label}-${Date.now()}-${padNumber(index + 1)}-${crypto.randomUUID().slice(0, 8)}`,
    name: `${TOOL_NAMES[index % TOOL_NAMES.length]} ${padNumber(index + 1, 2)}`,
    description: "Seeded inventory item for testing borrowing, logs, and barcode printing flows.",
    category: TOOL_CATEGORIES[index % TOOL_CATEGORIES.length],
    currentStatus: "available",
    createdAt: daysAgo(90 - index * 2, 9 + (index % 5)),
    updatedAt: daysAgo(90 - index * 2, 11 + (index % 5)),
  }));

  const insertedTools = await db.insert(tools).values(toolValues).returning();

  await Promise.all(
    insertedTools.map((tool) =>
      db
        .update(tools)
        .set({
          barcode: formatToolBarcode(tool.id),
          updatedAt: tool.updatedAt,
        })
        .where(eq(tools.id, tool.id)),
    ),
  );

  return insertedTools.map((tool) => ({
    ...tool,
    barcode: formatToolBarcode(tool.id),
  }));
}
