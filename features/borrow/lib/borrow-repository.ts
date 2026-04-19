import { appDb } from "@/core/db/app-db";
import type { ToolRecord, ToolTransactionRecord } from "@/core/db/schema";
import type {
  BorrowerReceiptIdentity,
  ReceiptItem,
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

function isBorrowedTransaction(
  transaction: ToolTransactionRecord,
): transaction is ToolTransactionRecord & { transactionType: "borrowed" } {
  return transaction.transactionType === "borrowed";
}

function toReceiptItem(tool: Pick<ToolRecord, "id" | "name" | "barcode" | "category">, borrowedAt: Date | null): ReceiptItem {
  return {
    toolId: tool.id,
    toolName: tool.name,
    barcode: tool.barcode,
    category: tool.category,
    borrowedAt,
  };
}

function matchesBorrowerIdentity(
  transaction: ToolTransactionRecord,
  borrower: BorrowerReceiptIdentity,
) {
  if (borrower.borrowerId && transaction.borrowerId === borrower.borrowerId) {
    return true;
  }

  if (borrower.borrowerSchoolId && transaction.borrowerSchoolId === borrower.borrowerSchoolId) {
    return true;
  }

  return !transaction.borrowerId && !transaction.borrowerSchoolId && transaction.borrowerName === borrower.borrowerName;
}

function getMostRecentBorrowTransaction(transactions: ToolTransactionRecord[]) {
  return (
    [...transactions]
      .filter(isBorrowedTransaction)
      .sort((left, right) => right.recordedAt.getTime() - left.recordedAt.getTime())
      .at(0) ?? null
  );
}

export async function getLastBorrowTransaction(toolId: number) {
  const transactions = await appDb.transactions
    .where("[toolId+transactionType]")
    .equals([toolId, "borrowed"])
    .toArray();

  return getMostRecentBorrowTransaction(transactions);
}

export async function listTransactions(): Promise<TransactionRecord[]> {
  const transactions = await appDb.transactions.orderBy("recordedAt").reverse().toArray();

  return transactions.map((transaction) => ({
    id: transaction.id,
    barcode: transaction.barcode,
    toolName: transaction.toolName,
    borrowerSchoolId: transaction.borrowerSchoolId,
    borrowerName: transaction.borrowerName,
    transactionType: transaction.transactionType,
    recordedAt: transaction.recordedAt,
  }));
}

export async function listOutstandingBorrowedItems(
  borrower: BorrowerReceiptIdentity,
): Promise<ReceiptItem[]> {
  try {
    const outstandingTools = await appDb.tools
      .where("currentStatus")
      .anyOf("borrowed", "missing")
      .toArray();
    const receiptItems = await Promise.all(
      outstandingTools
        .filter((tool) => !tool.deletedAt)
        .map(async (tool) => {
          const lastBorrowTransaction = await getLastBorrowTransaction(tool.id);

          if (!lastBorrowTransaction || !matchesBorrowerIdentity(lastBorrowTransaction, borrower)) {
            return null;
          }

          return toReceiptItem(tool, lastBorrowTransaction.recordedAt);
        }),
    );

    return receiptItems
      .filter((item): item is ReceiptItem => item !== null)
      .sort((left, right) => {
        const leftBorrowedAt = left.borrowedAt?.getTime() ?? 0;
        const rightBorrowedAt = right.borrowedAt?.getTime() ?? 0;

        return leftBorrowedAt - rightBorrowedAt || left.toolName.localeCompare(right.toolName);
      });
  } catch {
    return [];
  }
}

export async function processScanTransaction(
  barcode: string,
  mode: ScanMode,
  borrowerId?: string,
): Promise<ProcessScanTransactionResult> {
  try {
    return await appDb.transaction("rw", appDb.tools, appDb.borrowers, appDb.transactions, async () => {
      const trimmedBarcode = barcode.trim();
      const tool = await appDb.tools.where("barcode").equals(trimmedBarcode).first();

      if (!tool || tool.deletedAt) {
        return createScanError("NOT_FOUND");
      }

      if (mode === "borrow") {
        if (tool.currentStatus !== "available") {
          return createScanError("NOT_AVAILABLE_FOR_BORROW");
        }

        if (!borrowerId) {
          return createScanError("NO_BORROWER");
        }

        const borrower = await appDb.borrowers.get(borrowerId);

        if (!borrower || borrower.deletedAt) {
          return createScanError("DB_ERROR");
        }

        const recordedAt = new Date();
        const transactionId = await appDb.transactions.add({
          toolId: tool.id,
          barcode: tool.barcode,
          toolName: tool.name,
          borrowerId: borrower.id,
          borrowerSchoolId: borrower.schoolId,
          borrowerName: borrower.name,
          transactionType: "borrowed",
          recordedAt,
          notes: null,
        });

        await appDb.tools.update(tool.id, {
          currentStatus: "borrowed",
          updatedAt: recordedAt,
        });

        return {
          action: "borrowed",
          toolId: tool.id,
          toolName: tool.name,
          barcode: tool.barcode,
          category: tool.category,
          borrowerId: borrower.id,
          borrowerSchoolId: borrower.schoolId,
          borrowerName: borrower.name,
          transactionId,
          recordedAt,
        };
      }

      if (tool.currentStatus === "available") {
        return createScanError("NOT_AVAILABLE_FOR_RETURN");
      }

      if (tool.currentStatus !== "borrowed" && tool.currentStatus !== "missing") {
        return createScanError("DB_ERROR");
      }

      const lastBorrowTransactions = await appDb.transactions
        .where("[toolId+transactionType]")
        .equals([tool.id, "borrowed"])
        .toArray();
      const lastBorrowTransaction = getMostRecentBorrowTransaction(lastBorrowTransactions);
      const borrowerName = lastBorrowTransaction?.borrowerName ?? "Unknown borrower";
      const recordedAt = new Date();
      const transactionId = await appDb.transactions.add({
        toolId: tool.id,
        barcode: tool.barcode,
        toolName: tool.name,
        borrowerId: lastBorrowTransaction?.borrowerId ?? null,
        borrowerSchoolId: lastBorrowTransaction?.borrowerSchoolId ?? null,
        borrowerName,
        transactionType: "returned",
        recordedAt,
        notes: null,
      });

      await appDb.tools.update(tool.id, {
        currentStatus: "available",
        updatedAt: recordedAt,
      });

      return {
        action: "returned",
        toolId: tool.id,
        toolName: tool.name,
        barcode: tool.barcode,
        category: tool.category,
        borrowerId: lastBorrowTransaction?.borrowerId ?? null,
        borrowerSchoolId: lastBorrowTransaction?.borrowerSchoolId ?? null,
        borrowerName,
        transactionId,
        recordedAt,
      };
    });
  } catch {
    return createScanError("DB_ERROR");
  }
}

export async function previewReturnTransaction(
  barcode: string,
): Promise<PreviewReturnTransactionResult> {
  try {
    const trimmedBarcode = barcode.trim();
    const tool = await appDb.tools.where("barcode").equals(trimmedBarcode).first();

    if (!tool || tool.deletedAt) {
      return createScanError("NOT_FOUND");
    }

    if (tool.currentStatus === "available") {
      return createScanError("NOT_AVAILABLE_FOR_RETURN");
    }

    if (tool.currentStatus !== "borrowed" && tool.currentStatus !== "missing") {
      return createScanError("DB_ERROR");
    }

    const transactions = await appDb.transactions.where("toolId").equals(tool.id).toArray();
    const lastBorrowTransaction = getMostRecentBorrowTransaction(transactions);

    return {
      toolId: tool.id,
      toolName: tool.name,
      barcode: tool.barcode,
      borrowerId: lastBorrowTransaction?.borrowerId ?? null,
      borrowerSchoolId: lastBorrowTransaction?.borrowerSchoolId ?? null,
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
