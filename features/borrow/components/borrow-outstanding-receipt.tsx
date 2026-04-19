"use client";

import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import type { BorrowOutstandingReceipt } from "@/features/borrow/types";

import { ScanReceiptItemList } from "./scan-receipt-item-list";

type BorrowOutstandingReceiptProps = {
  receipt: BorrowOutstandingReceipt | null;
};

export function BorrowOutstandingReceipt({ receipt }: BorrowOutstandingReceiptProps) {
  if (!receipt) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-[calc(var(--radius-xl)+2px)] border border-border/70 bg-muted/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Borrow Receipt
          </p>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
            {receipt.borrowerName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {receipt.borrowerSchoolId ?? "No school ID"} / {receipt.items.length}{" "}
            {receipt.items.length === 1 ? "item" : "items"} currently borrowed by this borrower
          </p>
        </div>

        <p className="text-xs text-muted-foreground sm:text-right">
          Updated {formatRecordedAt(receipt.updatedAt)}
        </p>
      </div>

      <ScanReceiptItemList
        items={receipt.items}
        emptyTitle="No active borrowed items"
        emptyDescription="This borrower does not have any currently borrowed items to review."
        showBorrowedAt
        borrowedAtLabel="Last borrowed"
      />
    </section>
  );
}
