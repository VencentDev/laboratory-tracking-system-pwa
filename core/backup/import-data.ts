"use client";

import { z } from "zod";

import { appDb } from "@/core/db/app-db";
import { BACKUP_SCHEMA_VERSION, type AppBackup } from "@/core/db/schema";

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
