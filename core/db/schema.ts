export const APP_DB_NAME = "laboratory-tracking-system-pwa";
export const APP_DB_VERSION = 1;
export const BACKUP_SCHEMA_VERSION = 1;

export type ToolStatus = "available" | "borrowed" | "missing";
export type TransactionType = "borrowed" | "returned" | "correction";
export type BorrowerType = "student" | "instructor" | "staff";

export type ToolRecord = {
  id: number;
  barcode: string;
  name: string;
  description: string | null;
  category: string | null;
  currentStatus: ToolStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type BorrowerRecord = {
  id: string;
  schoolId: string;
  name: string;
  email: string | null;
  image: string | null;
  type: BorrowerType;
  program: string | null;
  yearLevel: number | null;
  section: string | null;
  contactNumber: string | null;
  createdAt: Date;
};

export type ToolTransactionRecord = {
  id: number;
  toolId: number;
  barcode: string;
  toolName: string;
  borrowerId: string | null;
  borrowerName: string;
  transactionType: TransactionType;
  recordedAt: Date;
  notes: string | null;
};

export type AppSettingRecord = {
  key: string;
  value: string;
  updatedAt: Date;
};

export type SerializedToolRecord = Omit<ToolRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type SerializedBorrowerRecord = Omit<BorrowerRecord, "createdAt"> & {
  createdAt: string;
};

export type SerializedToolTransactionRecord = Omit<ToolTransactionRecord, "recordedAt"> & {
  recordedAt: string;
};

export type SerializedAppSettingRecord = Omit<AppSettingRecord, "updatedAt"> & {
  updatedAt: string;
};

export type AppBackup = {
  schemaVersion: number;
  exportedAt: string;
  origin: string | null;
  data: {
    tools: SerializedToolRecord[];
    borrowers: SerializedBorrowerRecord[];
    transactions: SerializedToolTransactionRecord[];
    appSettings: SerializedAppSettingRecord[];
  };
};

