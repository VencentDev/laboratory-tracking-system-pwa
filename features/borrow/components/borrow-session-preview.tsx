"use client";

import { ReceiptItemsTable } from "@/features/borrow/components/receipt-items-table";
import type { BatchBorrowSession } from "@/features/borrow/types";

type BorrowSessionPreviewProps = {
  session: BatchBorrowSession | null;
};

export function BorrowSessionPreview({ session }: BorrowSessionPreviewProps) {
  if (!session) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-sm font-medium text-foreground">No receipt items yet</p>
          <p className="text-sm text-muted-foreground">
            Select a borrower and scan tools to see the receipt preview here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/45 bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Borrow Receipt
          </p>
          <h3 className="truncate text-lg font-semibold text-foreground">{session.borrowerName}</h3>
          <p className="text-sm text-muted-foreground">
            {session.borrowerSchoolId ?? "No school ID"}
          </p>
        </div>
        <div className="shrink-0 rounded-full border border-border/50 bg-background px-3 py-1 text-sm font-medium text-foreground">
          {session.items.length} {session.items.length === 1 ? "item" : "items"}
        </div>
      </div>

      <ReceiptItemsTable
        items={session.items}
        isLoading={false}
        emptyTitle="No scanned tools"
        emptyDescription="Scanned borrowed tools will appear here."
        borrowedAtLabel="Borrowed"
      />
    </section>
  );
}
