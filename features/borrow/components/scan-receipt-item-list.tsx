"use client";

import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import type { ReceiptItem } from "@/features/borrow/types";

type ScanReceiptItemListProps = {
  items: ReceiptItem[];
  emptyTitle: string;
  emptyDescription: string;
  showBorrowedAt?: boolean;
  borrowedAtLabel?: string;
};

export function ScanReceiptItemList({
  items,
  emptyTitle,
  emptyDescription,
  showBorrowedAt = false,
  borrowedAtLabel = "Borrowed",
}: ScanReceiptItemListProps) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-4 py-5 text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${item.toolId}-${item.barcode}-${item.borrowedAt?.toISOString() ?? "receipt-item"}`}
          className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.toolName}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{item.barcode}</p>
            </div>
            <span className="rounded-full border border-border/60 bg-muted/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {item.category ?? "Uncategorized"}
            </span>
          </div>

          {showBorrowedAt && item.borrowedAt ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {borrowedAtLabel}: {formatRecordedAt(item.borrowedAt)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
