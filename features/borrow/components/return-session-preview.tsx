"use client";

import { ReceiptItemsTable } from "@/features/borrow/components/receipt-items-table";
import type { BatchReturnSession } from "@/features/borrow/types";

type ReturnSessionPreviewProps = {
  session: BatchReturnSession | null;
};

export function ReturnSessionPreview({ session }: ReturnSessionPreviewProps) {
  if (!session) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-sm font-medium text-foreground">No return session yet</p>
          <p className="text-sm text-muted-foreground">Scan a tool to start a return session.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-border/45 bg-muted/20 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Return Receipt
        </p>
        <h3 className="mt-1 truncate text-lg font-semibold text-foreground">{session.borrowerName}</h3>
        <p className="text-sm text-muted-foreground">
          {session.borrowerSchoolId ?? "No school ID"}
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900">
          Returned ({session.returnedItems.length})
        </div>
        <ReceiptItemsTable
          items={session.returnedItems}
          isLoading={false}
          emptyTitle="No returned tools"
          emptyDescription="Confirmed returned tools will appear here."
          borrowedAtLabel="Borrowed"
        />
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border/45 bg-muted/25 px-4 py-2 text-sm font-medium text-foreground">
          Still Unreturned ({session.unreturnedItems.length})
        </div>
        <ReceiptItemsTable
          items={session.unreturnedItems}
          isLoading={false}
          emptyTitle="No still-unreturned tools"
          emptyDescription="This borrower has no other outstanding borrowed tools."
          borrowedAtLabel="Borrowed"
        />
      </div>
    </section>
  );
}
