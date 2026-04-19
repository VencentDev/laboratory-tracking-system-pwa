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
  toolId: number;
  toolName: string;
  barcode: string;
  category: string | null;
  borrowerId: string | null;
  borrowerSchoolId: string | null;
  borrowerName: string;
  transactionId: number;
  recordedAt: Date;
};

export type ReturnPreview = {
  toolId: number;
  toolName: string;
  barcode: string;
  borrowerId: string | null;
  borrowerSchoolId: string | null;
  borrowerName: string;
  currentStatus: Exclude<ToolStatus, "available">;
  category: string | null;
  description: string | null;
  lastBorrowedAt: Date | null;
};

export type ReceiptItem = {
  toolId: number;
  toolName: string;
  barcode: string;
  category: string | null;
  borrowedAt: Date | null;
};

export type BorrowOutstandingReceipt = {
  borrowerId: string;
  borrowerSchoolId: string | null;
  borrowerName: string;
  items: ReceiptItem[];
  updatedAt: Date;
};

export type BorrowerReceiptIdentity = {
  borrowerId: string | null;
  borrowerSchoolId: string | null;
  borrowerName: string;
};

export type ReturnOutstandingReceipt = BorrowerReceiptIdentity & {
  lastReturnedItem: ReceiptItem;
  items: ReceiptItem[];
  updatedAt: Date;
};

export type ScanFeedback = {
  type: "success" | "error";
  message: string;
};

export type TransactionRecord = {
  id: number;
  barcode: string;
  toolName: string;
  borrowerSchoolId: string | null;
  borrowerName: string;
  transactionType: TransactionType;
  recordedAt: Date;
};
