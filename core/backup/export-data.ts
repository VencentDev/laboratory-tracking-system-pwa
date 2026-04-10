"use client";

import { appDb } from "@/core/db/app-db";
import { setAppSetting } from "@/core/db/app-settings";
import { BACKUP_SCHEMA_VERSION, type AppBackup } from "@/core/db/schema";

function toBackup() {
  return appDb.transaction(
    "r",
    appDb.tools,
    appDb.borrowers,
    appDb.transactions,
    appDb.appSettings,
    async (): Promise<AppBackup> => {
      const [tools, borrowers, transactions, appSettings] = await Promise.all([
        appDb.tools.orderBy("createdAt").toArray(),
        appDb.borrowers.orderBy("createdAt").toArray(),
        appDb.transactions.orderBy("recordedAt").toArray(),
        appDb.appSettings.orderBy("updatedAt").toArray(),
      ]);

      return {
        schemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        origin: typeof window === "undefined" ? null : window.location.origin,
        data: {
          tools: tools.map((tool) => ({
            ...tool,
            createdAt: tool.createdAt.toISOString(),
            updatedAt: tool.updatedAt.toISOString(),
          })),
          borrowers: borrowers.map((borrower) => ({
            ...borrower,
            createdAt: borrower.createdAt.toISOString(),
          })),
          transactions: transactions.map((transaction) => ({
            ...transaction,
            recordedAt: transaction.recordedAt.toISOString(),
          })),
          appSettings: appSettings.map((setting) => ({
            ...setting,
            updatedAt: setting.updatedAt.toISOString(),
          })),
        },
      };
    },
  );
}

function escapeCsvValue(value: string | number | null | undefined) {
  const normalizedValue = value == null ? "" : String(value);

  if (!/[",\n]/.test(normalizedValue)) {
    return normalizedValue;
  }

  return `"${normalizedValue.replaceAll('"', '""')}"`;
}

function buildCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const lines = [
    headers.join(","),
    ...rows.map((row) => row.map((value) => escapeCsvValue(value)).join(",")),
  ];

  return `${lines.join("\n")}\n`;
}

function downloadBlob(blob: Blob, filename: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(downloadUrl);
}

function buildTimestampLabel() {
  return new Date().toISOString().replaceAll(":", "-");
}

export async function exportJsonBackup() {
  const backup = await toBackup();
  const filename = `lab-tracking-backup-${buildTimestampLabel()}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });

  downloadBlob(blob, filename);
  await setAppSetting("lastBackupAt", new Date().toISOString());

  return backup;
}

export async function exportBorrowersCsv() {
  const borrowers = await appDb.borrowers.orderBy("createdAt").reverse().toArray();
  const csv = buildCsv(
    ["School ID", "Name", "Type", "Program", "Year Level", "Section", "Contact Number", "Created At"],
    borrowers.map((borrower) => [
      borrower.schoolId,
      borrower.name,
      borrower.type,
      borrower.program,
      borrower.yearLevel,
      borrower.section,
      borrower.contactNumber,
      borrower.createdAt.toISOString(),
    ]),
  );

  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `lab-borrowers-${buildTimestampLabel()}.csv`,
  );
}

export async function exportTransactionsCsv() {
  const transactions = await appDb.transactions.orderBy("recordedAt").reverse().toArray();
  const csv = buildCsv(
    ["Barcode", "Tool", "Borrower", "Transaction Type", "Recorded At", "Notes"],
    transactions.map((transaction) => [
      transaction.barcode,
      transaction.toolName,
      transaction.borrowerName,
      transaction.transactionType,
      transaction.recordedAt.toISOString(),
      transaction.notes,
    ]),
  );

  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `lab-transactions-${buildTimestampLabel()}.csv`,
  );
}

