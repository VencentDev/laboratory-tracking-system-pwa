import type { ToolStatus, TransactionType } from "@/core/db/schema";

export type ScanMode = "borrow" | "return";

export type ScanErrorCode =
  | "NOT_FOUND"
  | "NO_BORROWER"
  | "NOT_AVAILABLE_FOR_BORROW"
  | "NOT_AVAILABLE_FOR_RETURN"
  | "DB_ERROR";

export type ScanError = {
  code: ScanErrorCode;
};

export type ScanResult = {
  action: "borrowed" | "returned";
  toolName: string;
  barcode: string;
  borrowerName: string;
  transactionId: number;
  recordedAt: Date;
};

export type ReturnPreview = {
  toolId: number;
  toolName: string;
  barcode: string;
  borrowerName: string;
  currentStatus: Exclude<ToolStatus, "available">;
  category: string | null;
  description: string | null;
  lastBorrowedAt: Date | null;
};

export type ScanFeedback = {
  type: "success" | "error";
  message: string;
};

export type TransactionRecord = {
  id: number;
  barcode: string;
  toolName: string;
  borrowerName: string;
  transactionType: TransactionType;
  recordedAt: Date;
};
