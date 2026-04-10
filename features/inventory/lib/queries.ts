import { desc, eq } from "drizzle-orm";

import { db } from "@/core/db";
import { tools } from "@/core/db/schema";
import { formatToolBarcode } from "@/features/inventory/lib/barcode";
import type { ToolInput } from "@/features/inventory/lib/validations";

function normalizeOptionalText(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

export async function getAllTools() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    return await db.select().from(tools).orderBy(desc(tools.createdAt));
  } catch {
    return [];
  }
}

export async function getToolByBarcode(barcode: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [tool] = await db.select().from(tools).where(eq(tools.barcode, barcode)).limit(1);

    return tool ?? null;
  } catch {
    return null;
  }
}

export async function getToolById(id: number) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [tool] = await db.select().from(tools).where(eq(tools.id, id)).limit(1);

    return tool ?? null;
  } catch {
    return null;
  }
}

export async function createTool(data: ToolInput) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    return await db.transaction(async (tx) => {
      const [createdTool] = await tx
        .insert(tools)
        .values({
          barcode: `PENDING-${crypto.randomUUID()}`,
          name: data.name,
          description: normalizeOptionalText(data.description),
          category: normalizeOptionalText(data.category),
          currentStatus: "available",
        })
        .returning();

      if (!createdTool) {
        return null;
      }

      const [tool] = await tx
        .update(tools)
        .set({
          barcode: formatToolBarcode(createdTool.id),
          updatedAt: new Date(),
        })
        .where(eq(tools.id, createdTool.id))
        .returning();

      return tool ?? null;
    });
  } catch {
    return null;
  }
}

export async function updateTool(id: number, data: ToolInput) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [tool] = await db
      .update(tools)
        .set({
          name: data.name,
          description: normalizeOptionalText(data.description),
          category: normalizeOptionalText(data.category),
          currentStatus: data.currentStatus,
          updatedAt: new Date(),
        })
      .where(eq(tools.id, id))
      .returning();

    return tool ?? null;
  } catch {
    return null;
  }
}

export async function deleteTool(id: number) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [tool] = await db.delete(tools).where(eq(tools.id, id)).returning();

    return tool ?? null;
  } catch {
    return null;
  }
}
