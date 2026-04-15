import { appDb } from "@/core/db/app-db";
import { formatToolBarcode } from "@/features/inventory/lib/barcode";
import type { ToolInput } from "@/features/inventory/lib/validations";
import type { ToolProfile } from "@/features/inventory/types";
import { purgeExpiredTrashedTools } from "@/features/trash/lib/trash-cleanup";

function normalizeOptionalText(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function isActiveTool(tool: ToolProfile | undefined | null): tool is ToolProfile {
  return Boolean(tool && !tool.deletedAt);
}

export async function listTools(): Promise<ToolProfile[]> {
  await purgeExpiredTrashedTools();

  const tools = await appDb.tools.orderBy("createdAt").reverse().toArray();

  return tools.filter(isActiveTool);
}

export async function listDeletedTools(): Promise<ToolProfile[]> {
  await purgeExpiredTrashedTools();

  const tools = await appDb.tools.orderBy("deletedAt").reverse().toArray();

  return tools.filter((tool): tool is ToolProfile => Boolean(tool.deletedAt));
}

export async function getToolByBarcode(barcode: string) {
  await purgeExpiredTrashedTools();

  const trimmedBarcode = barcode.trim();

  if (!trimmedBarcode) {
    return null;
  }

  const tool = await appDb.tools.where("barcode").equals(trimmedBarcode).first();

  return isActiveTool(tool) ? tool : null;
}

export async function getToolById(id: number) {
  await purgeExpiredTrashedTools();

  const tool = await appDb.tools.get(id);

  return isActiveTool(tool) ? tool : null;
}

export async function createTool(data: ToolInput) {
  try {
    await purgeExpiredTrashedTools();

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
        deletedAt: null,
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
    await purgeExpiredTrashedTools();

    const existingTool = await appDb.tools.get(id);

    if (!isActiveTool(existingTool)) {
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
    await purgeExpiredTrashedTools();

    return await appDb.transaction("rw", appDb.tools, async () => {
      const existingTool = await appDb.tools.get(id);

      if (!isActiveTool(existingTool)) {
        return null;
      }

      await appDb.tools.update(id, {
        deletedAt: new Date(),
        updatedAt: new Date(),
      });

      return existingTool;
    });
  } catch {
    return null;
  }
}

export async function deleteTools(ids: number[]) {
  try {
    await purgeExpiredTrashedTools();

    const uniqueIds = Array.from(new Set(ids));

    if (uniqueIds.length === 0) {
      return [];
    }

    return await appDb.transaction("rw", appDb.tools, async () => {
      const existingTools = (await appDb.tools.bulkGet(uniqueIds)).filter(isActiveTool);

      if (existingTools.length === 0) {
        return [];
      }

      const deletedAt = new Date();

      for (const tool of existingTools) {
        await appDb.tools.update(tool.id, {
          deletedAt,
          updatedAt: deletedAt,
        });
      }

      return existingTools;
    });
  } catch {
    return null;
  }
}

export async function restoreTool(id: number) {
  try {
    await purgeExpiredTrashedTools();

    return await appDb.transaction("rw", appDb.tools, async () => {
      const existingTool = await appDb.tools.get(id);

      if (!existingTool?.deletedAt) {
        return null;
      }

      await appDb.tools.update(id, {
        deletedAt: null,
        updatedAt: new Date(),
      });

      return (await appDb.tools.get(id)) ?? null;
    });
  } catch {
    return null;
  }
}

export async function permanentlyDeleteTool(id: number) {
  try {
    await purgeExpiredTrashedTools();

    return await appDb.transaction("rw", appDb.tools, async () => {
      const existingTool = await appDb.tools.get(id);

      if (!existingTool?.deletedAt) {
        return null;
      }

      await appDb.tools.delete(id);

      return existingTool;
    });
  } catch {
    return null;
  }
}
