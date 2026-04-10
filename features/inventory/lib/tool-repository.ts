import { appDb } from "@/core/db/app-db";
import { formatToolBarcode } from "@/features/inventory/lib/barcode";
import type { ToolInput } from "@/features/inventory/lib/validations";
import type { ToolProfile } from "@/features/inventory/types";

function normalizeOptionalText(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

export async function listTools(): Promise<ToolProfile[]> {
  return appDb.tools.orderBy("createdAt").reverse().toArray();
}

export async function getToolByBarcode(barcode: string) {
  const trimmedBarcode = barcode.trim();

  if (!trimmedBarcode) {
    return null;
  }

  return (await appDb.tools.where("barcode").equals(trimmedBarcode).first()) ?? null;
}

export async function getToolById(id: number) {
  return (await appDb.tools.get(id)) ?? null;
}

export async function createTool(data: ToolInput) {
  try {
    return await appDb.transaction("rw", appDb.tools, async () => {
      const now = new Date();
      const createdId = await appDb.tools.add({
        barcode: `PENDING-${crypto.randomUUID()}`,
        name: data.name.trim(),
        description: normalizeOptionalText(data.description),
        category: normalizeOptionalText(data.category),
        currentStatus: "available",
        createdAt: now,
        updatedAt: now,
      });

      await appDb.tools.update(createdId, {
        barcode: formatToolBarcode(createdId),
        updatedAt: new Date(),
      });

      return (await appDb.tools.get(createdId)) ?? null;
    });
  } catch {
    return null;
  }
}

export async function updateTool(id: number, data: ToolInput) {
  try {
    const existingTool = await appDb.tools.get(id);

    if (!existingTool) {
      return null;
    }

    await appDb.tools.update(id, {
      name: data.name.trim(),
      description: normalizeOptionalText(data.description),
      category: normalizeOptionalText(data.category),
      currentStatus: data.currentStatus,
      updatedAt: new Date(),
    });

    return (await appDb.tools.get(id)) ?? null;
  } catch {
    return null;
  }
}

export async function deleteTool(id: number) {
  try {
    return await appDb.transaction("rw", appDb.tools, appDb.transactions, async () => {
      const existingTool = await appDb.tools.get(id);

      if (!existingTool) {
        return null;
      }

      await appDb.transactions.where("toolId").equals(id).delete();
      await appDb.tools.delete(id);

      return existingTool;
    });
  } catch {
    return null;
  }
}

