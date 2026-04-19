"use client";

import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import type { ReturnOutstandingReceipt } from "@/features/borrow/types";

import { ScanReceiptItemList } from "./scan-receipt-item-list";

type ReturnOutstandingReceiptProps = {
  receipt: ReturnOutstandingReceipt | null;
};

export function ReturnOutstandingReceipt({
  receipt,
}: ReturnOutstandingReceiptProps) {
  if (!receipt) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-[calc(var(--radius-xl)+2px)] border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
          Return Receipt
        </p>
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
          {receipt.borrowerName}
        </h3>
        <p className="text-sm text-muted-foreground">
          {receipt.borrowerSchoolId ?? "No school ID"} / Updated {formatRecordedAt(receipt.updatedAt)}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-background/80 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Just Returned
        </p>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {receipt.lastReturnedItem.toolName}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {receipt.lastReturnedItem.barcode}
            </p>
          </div>
          <span className="rounded-full border border-border/60 bg-muted/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {receipt.lastReturnedItem.category ?? "Uncategorized"}
          </span>
        </div>
        {receipt.lastReturnedItem.borrowedAt ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Last borrowed {formatRecordedAt(receipt.lastReturnedItem.borrowedAt)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Items still not returned</p>
          <p className="text-sm text-muted-foreground">
            Review the remaining borrowed tools for this borrower after the confirmed return.
          </p>
        </div>
        <ScanReceiptItemList
          items={receipt.items}
          emptyTitle="All items returned"
          emptyDescription="This borrower has no remaining borrowed items after this return."
          showBorrowedAt
        />
      </div>
    </section>
  );
}
