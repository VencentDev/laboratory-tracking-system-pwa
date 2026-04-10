"use client";

import { z } from "zod";

import { appDb } from "@/core/db/app-db";
import type {
  BorrowerRecord,
  BorrowerType,
  ToolRecord,
  ToolStatus,
  TransactionType,
} from "@/core/db/schema";
import { BACKUP_SCHEMA_VERSION, type AppBackup } from "@/core/db/schema";
import type { CsvImportSummary } from "@/core/lib/csv";
import {
  getCsvValue,
  parseOptionalDate,
  parseOptionalInteger,
  readCsvFile,
} from "@/core/lib/csv";

const serializedToolSchema = z.object({
  id: z.number().int().nonnegative(),
  barcode: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  category: z.string().nullable(),
  currentStatus: z.enum(["available", "borrowed", "missing"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const serializedBorrowerSchema = z.object({
  id: z.string().min(1),
  schoolId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().nullable(),
  image: z.string().nullable(),
  type: z.enum(["student", "instructor", "staff"]),
  program: z.string().nullable(),
  yearLevel: z.number().int().nullable(),
  section: z.string().nullable(),
  contactNumber: z.string().nullable(),
  createdAt: z.string().datetime(),
});

const serializedTransactionSchema = z.object({
  id: z.number().int().nonnegative(),
  toolId: z.number().int().nonnegative(),
  barcode: z.string().min(1),
  toolName: z.string().min(1),
  borrowerId: z.string().nullable(),
  borrowerName: z.string().min(1),
  transactionType: z.enum(["borrowed", "returned", "correction"]),
  recordedAt: z.string().datetime(),
  notes: z.string().nullable(),
});

const serializedSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  updatedAt: z.string().datetime(),
});

const appBackupSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string().datetime(),
  origin: z.string().nullable(),
  data: z.object({
    tools: z.array(serializedToolSchema),
    borrowers: z.array(serializedBorrowerSchema),
    transactions: z.array(serializedTransactionSchema),
    appSettings: z.array(serializedSettingSchema),
  }),
});

export async function parseBackupFile(file: File) {
  const contents = await file.text();

  return appBackupSchema.parse(JSON.parse(contents));
}

export async function restoreBackup(backupInput: AppBackup | z.infer<typeof appBackupSchema>) {
  const backup = appBackupSchema.parse(backupInput);

  if (backup.schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new Error("This backup was created by a newer app version and cannot be restored safely yet.");
  }

  await appDb.transaction(
    "rw",
    appDb.tools,
    appDb.borrowers,
    appDb.transactions,
    appDb.appSettings,
    async () => {
      await Promise.all([
        appDb.transactions.clear(),
        appDb.tools.clear(),
        appDb.borrowers.clear(),
        appDb.appSettings.clear(),
      ]);

      if (backup.data.tools.length) {
        await appDb.tools.bulkAdd(
          backup.data.tools.map((tool) => ({
            ...tool,
            createdAt: new Date(tool.createdAt),
            updatedAt: new Date(tool.updatedAt),
          })),
        );
      }

      if (backup.data.borrowers.length) {
        await appDb.borrowers.bulkAdd(
          backup.data.borrowers.map((borrower) => ({
            ...borrower,
            createdAt: new Date(borrower.createdAt),
          })),
        );
      }

      if (backup.data.transactions.length) {
        await appDb.transactions.bulkAdd(
          backup.data.transactions.map((transaction) => ({
            ...transaction,
            recordedAt: new Date(transaction.recordedAt),
          })),
        );
      }

      const restoredSettings = backup.data.appSettings.map((setting) => ({
        ...setting,
        updatedAt: new Date(setting.updatedAt),
      }));

      restoredSettings.push({
        key: "lastRestoreAt",
        value: new Date().toISOString(),
        updatedAt: new Date(),
      });

      if (restoredSettings.length) {
        await appDb.appSettings.bulkPut(restoredSettings);
      }
    },
  );
}

export async function clearAllLocalData() {
  await appDb.transaction(
    "rw",
    appDb.tools,
    appDb.borrowers,
    appDb.transactions,
    appDb.appSettings,
    async () => {
      await Promise.all([
        appDb.transactions.clear(),
        appDb.tools.clear(),
        appDb.borrowers.clear(),
        appDb.appSettings.clear(),
      ]);
    },
  );
}

export type ParsedBackup = z.infer<typeof appBackupSchema>;

function normalizeOptionalText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : null;
}

function isToolStatus(value: string): value is ToolStatus {
  return value === "available" || value === "borrowed" || value === "missing";
}

function isBorrowerType(value: string): value is BorrowerType {
  return value === "student" || value === "instructor" || value === "staff";
}

function isTransactionType(value: string): value is TransactionType {
  return value === "borrowed" || value === "returned" || value === "correction";
}

function normalizeTransactionTypeValue(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  const compactValue = normalizedValue.replace(/[^a-z]/g, "");

  if (
    normalizedValue === "borrow" ||
    compactValue === "checkout" ||
    compactValue === "checkedout"
  ) {
    return "borrowed";
  }

  if (
    normalizedValue === "return" ||
    compactValue === "checkin" ||
    compactValue === "checkedin"
  ) {
    return "returned";
  }

  return normalizedValue;
}

export async function importToolsCsv(file: File): Promise<CsvImportSummary> {
  const rows = await readCsvFile(file);
  const summary: CsvImportSummary = { created: 0, updated: 0, skipped: 0 };

  await appDb.transaction("rw", appDb.tools, async () => {
    for (const row of rows) {
      const barcode = getCsvValue(row, "Barcode").trim();
      const name = getCsvValue(row, "Name").trim();
      const currentStatusValue = getCsvValue(row, "Status", "Current Status").trim().toLowerCase();

      if (!barcode || !name || !isToolStatus(currentStatusValue)) {
        summary.skipped += 1;
        continue;
      }

      const now = new Date();
      const createdAt = parseOptionalDate(getCsvValue(row, "Created At"), now);
      const updatedAt = parseOptionalDate(getCsvValue(row, "Updated At"), createdAt);
      const existingTool = await appDb.tools.where("barcode").equals(barcode).first();
      const payload: Omit<ToolRecord, "id"> = {
        barcode,
        name,
        category: normalizeOptionalText(getCsvValue(row, "Category")),
        currentStatus: currentStatusValue,
        description: normalizeOptionalText(getCsvValue(row, "Description")),
        createdAt: existingTool?.createdAt ?? createdAt,
        updatedAt,
      };

      if (existingTool) {
        await appDb.tools.update(existingTool.id, payload);
        summary.updated += 1;
      } else {
        await appDb.tools.add(payload);
        summary.created += 1;
      }
    }
  });

  return summary;
}

export async function importBorrowersCsv(file: File): Promise<CsvImportSummary> {
  const rows = await readCsvFile(file);
  const summary: CsvImportSummary = { created: 0, updated: 0, skipped: 0 };

  await appDb.transaction("rw", appDb.borrowers, async () => {
    for (const row of rows) {
      const schoolId = getCsvValue(row, "School ID").trim();
      const name = getCsvValue(row, "Name").trim();
      const typeValue = getCsvValue(row, "Type").trim().toLowerCase();

      if (!schoolId || !name || !isBorrowerType(typeValue)) {
        summary.skipped += 1;
        continue;
      }

      const existingBorrower = await appDb.borrowers.where("schoolId").equals(schoolId).first();
      const payload: Omit<BorrowerRecord, "id"> = {
        schoolId,
        name,
        type: typeValue,
        email: existingBorrower?.email ?? null,
        image: existingBorrower?.image ?? null,
        program: normalizeOptionalText(getCsvValue(row, "Program")),
        yearLevel: parseOptionalInteger(getCsvValue(row, "Year Level")),
        section: normalizeOptionalText(getCsvValue(row, "Section")),
        contactNumber: normalizeOptionalText(getCsvValue(row, "Contact Number")),
        createdAt: existingBorrower?.createdAt ?? parseOptionalDate(getCsvValue(row, "Created At")),
      };

      if (existingBorrower) {
        await appDb.borrowers.update(existingBorrower.id, payload);
        summary.updated += 1;
      } else {
        await appDb.borrowers.add({
          id: crypto.randomUUID(),
          ...payload,
        });
        summary.created += 1;
      }
    }
  });

  return summary;
}

export async function importTransactionsCsv(file: File): Promise<CsvImportSummary> {
  const rows = await readCsvFile(file);
  const summary: CsvImportSummary = { created: 0, updated: 0, skipped: 0 };
  const touchedToolIds = new Set<number>();

  await appDb.transaction("rw", appDb.tools, appDb.borrowers, appDb.transactions, async () => {
    const existingTransactions = await appDb.transactions.toArray();
    const existingKeys = new Set(
      existingTransactions.map((transaction) =>
        [
          transaction.barcode,
          transaction.borrowerId ?? "",
          transaction.borrowerName,
          transaction.transactionType,
          transaction.recordedAt.toISOString(),
        ].join("|"),
      ),
    );

    for (const row of rows) {
      const barcode = getCsvValue(row, "Barcode").trim();
      const transactionTypeValue = normalizeTransactionTypeValue(
        getCsvValue(row, "Transaction Type", "Action", "Type"),
      );
      const recordedAt = parseOptionalDate(getCsvValue(row, "Recorded At"));

      if (!barcode || !isTransactionType(transactionTypeValue)) {
        summary.skipped += 1;
        continue;
      }

      const tool = await appDb.tools.where("barcode").equals(barcode).first();

      if (!tool) {
        summary.skipped += 1;
        continue;
      }

      const borrowerSchoolId = getCsvValue(row, "Borrower School ID", "School ID").trim();
      const borrower = borrowerSchoolId
        ? await appDb.borrowers.where("schoolId").equals(borrowerSchoolId).first()
        : null;
      const borrowerName = borrower?.name ?? (getCsvValue(row, "Borrower").trim() || "Unknown borrower");
      const dedupeKey = [
        barcode,
        borrower?.id ?? "",
        borrowerName,
        transactionTypeValue,
        recordedAt.toISOString(),
      ].join("|");

      if (existingKeys.has(dedupeKey)) {
        summary.skipped += 1;
        continue;
      }

      await appDb.transactions.add({
        toolId: tool.id,
        barcode: tool.barcode,
        toolName: getCsvValue(row, "Tool").trim() || tool.name,
        borrowerId: borrower?.id ?? null,
        borrowerName,
        transactionType: transactionTypeValue,
        recordedAt,
        notes: normalizeOptionalText(getCsvValue(row, "Notes")),
      });

      existingKeys.add(dedupeKey);
      touchedToolIds.add(tool.id);
      summary.created += 1;
    }

    for (const toolId of touchedToolIds) {
      const tool = await appDb.tools.get(toolId);

      if (!tool) {
        continue;
      }

      const toolTransactions = await appDb.transactions.where("toolId").equals(toolId).toArray();
      const latestTransaction = [...toolTransactions].sort(
        (left, right) => right.recordedAt.getTime() - left.recordedAt.getTime(),
      )[0];

      if (!latestTransaction) {
        continue;
      }

      const currentStatus =
        latestTransaction.transactionType === "borrowed"
          ? "borrowed"
          : latestTransaction.transactionType === "returned"
            ? "available"
            : tool.currentStatus;

      await appDb.tools.update(toolId, {
        currentStatus,
        updatedAt: latestTransaction.recordedAt,
      });
    }
  });

  return summary;
}
