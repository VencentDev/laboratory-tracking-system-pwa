import { and, desc, eq } from "drizzle-orm";

import { db } from "@/core/db";
import { borrowers, toolTransactions, tools } from "@/core/db/schema";
import type {
  ReturnPreview,
  ScanError,
  ScanErrorCode,
  ScanMode,
  ScanResult,
  TransactionRecord,
} from "@/features/borrow/types";

export type ProcessScanTransactionResult = ScanResult | ScanError;
export type PreviewReturnTransactionResult = ReturnPreview | ScanError;

function createScanError(code: ScanErrorCode): ScanError {
  return { code };
}

function isScanTransactionError(value: unknown): value is ScanError {
  return typeof value === "object" && value !== null && "code" in value;
}

export async function getLastBorrowTransaction(toolId: number) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [transaction] = await db
      .select()
      .from(toolTransactions)
      .where(and(eq(toolTransactions.toolId, toolId), eq(toolTransactions.transactionType, "borrowed")))
      .orderBy(desc(toolTransactions.recordedAt))
      .limit(1);

    return transaction ?? null;
  } catch {
    return null;
  }
}

export async function getAllTransactions(): Promise<TransactionRecord[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    return await db
      .select({
        id: toolTransactions.id,
        barcode: tools.barcode,
        toolName: tools.name,
        borrowerName: toolTransactions.borrowerName,
        transactionType: toolTransactions.transactionType,
        recordedAt: toolTransactions.recordedAt,
      })
      .from(toolTransactions)
      .innerJoin(tools, eq(toolTransactions.toolId, tools.id))
      .orderBy(desc(toolTransactions.recordedAt));
  } catch {
    return [];
  }
}

export async function processScanTransaction(
  barcode: string,
  mode: ScanMode,
  borrowerId?: string,
): Promise<ProcessScanTransactionResult> {
  if (!process.env.DATABASE_URL) {
    return createScanError("DB_ERROR");
  }

  try {
    return await db.transaction(async (tx) => {
      const trimmedBarcode = barcode.trim();
      const [tool] = await tx.select().from(tools).where(eq(tools.barcode, trimmedBarcode)).limit(1);

      if (!tool) {
        throw createScanError("NOT_FOUND");
      }

      if (mode === "borrow") {
        if (tool.currentStatus !== "available") {
          throw createScanError("NOT_AVAILABLE_FOR_BORROW");
        }

        if (!borrowerId) {
          throw createScanError("NO_BORROWER");
        }

        const [borrower] = await tx.select().from(borrowers).where(eq(borrowers.id, borrowerId)).limit(1);

        if (!borrower) {
          throw createScanError("DB_ERROR");
        }

        const [transaction] = await tx
          .insert(toolTransactions)
          .values({
            toolId: tool.id,
            borrowerId: borrower.id,
            borrowerName: borrower.name,
            transactionType: "borrowed",
          })
          .returning();

        await tx
          .update(tools)
          .set({
            currentStatus: "borrowed",
            updatedAt: new Date(),
          })
          .where(eq(tools.id, tool.id));

        return {
          action: "borrowed",
          toolName: tool.name,
          barcode: tool.barcode,
          borrowerName: borrower.name,
          transactionId: transaction.id,
          recordedAt: transaction.recordedAt,
        };
      }

      if (tool.currentStatus === "available") {
        throw createScanError("NOT_AVAILABLE_FOR_RETURN");
      }

      if (tool.currentStatus === "borrowed" || tool.currentStatus === "missing") {
        const [lastBorrowTransaction] = await tx
          .select()
          .from(toolTransactions)
          .where(and(eq(toolTransactions.toolId, tool.id), eq(toolTransactions.transactionType, "borrowed")))
          .orderBy(desc(toolTransactions.recordedAt))
          .limit(1);

        const borrowerName = lastBorrowTransaction?.borrowerName ?? "Unknown borrower";

        const [transaction] = await tx
          .insert(toolTransactions)
          .values({
            toolId: tool.id,
            borrowerId: lastBorrowTransaction?.borrowerId ?? null,
            borrowerName,
            transactionType: "returned",
          })
          .returning();

        await tx
          .update(tools)
          .set({
            currentStatus: "available",
            updatedAt: new Date(),
          })
          .where(eq(tools.id, tool.id));

        return {
          action: "returned",
          toolName: tool.name,
          barcode: tool.barcode,
          borrowerName,
          transactionId: transaction.id,
          recordedAt: transaction.recordedAt,
        };
      }

      throw createScanError("DB_ERROR");
    });
  } catch (error) {
    if (isScanTransactionError(error)) {
      return error;
    }

    return createScanError("DB_ERROR");
  }
}

export async function previewReturnTransaction(
  barcode: string,
): Promise<PreviewReturnTransactionResult> {
  if (!process.env.DATABASE_URL) {
    return createScanError("DB_ERROR");
  }

  try {
    const trimmedBarcode = barcode.trim();
    const [tool] = await db.select().from(tools).where(eq(tools.barcode, trimmedBarcode)).limit(1);

    if (!tool) {
      return createScanError("NOT_FOUND");
    }

    if (tool.currentStatus === "available") {
      return createScanError("NOT_AVAILABLE_FOR_RETURN");
    }

    if (tool.currentStatus !== "borrowed" && tool.currentStatus !== "missing") {
      return createScanError("DB_ERROR");
    }

    const [lastBorrowTransaction] = await db
      .select()
      .from(toolTransactions)
      .where(and(eq(toolTransactions.toolId, tool.id), eq(toolTransactions.transactionType, "borrowed")))
      .orderBy(desc(toolTransactions.recordedAt))
      .limit(1);

    return {
      toolId: tool.id,
      toolName: tool.name,
      barcode: tool.barcode,
      borrowerName: lastBorrowTransaction?.borrowerName ?? "Unknown borrower",
      currentStatus: tool.currentStatus,
      category: tool.category,
      description: tool.description,
      lastBorrowedAt: lastBorrowTransaction?.recordedAt ?? null,
    };
  } catch {
    return createScanError("DB_ERROR");
  }
}
