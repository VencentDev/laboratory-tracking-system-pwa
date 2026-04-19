"use client";

import { Button } from "@/core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/ui/dialog";
import { ReceiptItemsTable } from "@/features/borrow/components/receipt-items-table";
import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import type { ReturnOutstandingReceipt } from "@/features/borrow/types";

type ReturnReceiptDialogProps = {
  receipt: ReturnOutstandingReceipt | null;
  onClose: () => void;
  onContinue: () => void;
};

export function ReturnReceiptDialog({
  receipt,
  onClose,
  onContinue,
}: ReturnReceiptDialogProps) {
  const open = receipt !== null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      {receipt ? (
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Return Receipt
                </p>
                <DialogTitle className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  Active Borrowed Items
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Review what is still checked out after the confirmed return.
                </DialogDescription>
              </div>
              <div className="rounded-2xl border border-border/45 bg-muted/25 px-4 py-3 text-left sm:min-w-[14rem] sm:text-right">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Updated
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatRecordedAt(receipt.updatedAt)}
                </p>
              </div>
            </div>

            <dl className="grid gap-3 rounded-2xl border border-border/45 bg-muted/20 p-4 sm:grid-cols-3">
              <ReceiptMeta label="Borrower" value={receipt.borrowerName} />
              <ReceiptMeta label="School ID" value={receipt.borrowerSchoolId ?? "No school ID"} />
              <ReceiptMeta
                label="Items Left"
                value={`${receipt.items.length} ${receipt.items.length === 1 ? "item" : "items"}`}
              />
            </dl>
          </DialogHeader>

          <section className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                    Just Returned
                  </p>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                    {receipt.lastReturnedItem.toolName}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    {receipt.lastReturnedItem.barcode}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/15 bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {receipt.lastReturnedItem.category ?? "Uncategorized"}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Last borrowed{" "}
                {receipt.lastReturnedItem.borrowedAt
                  ? formatRecordedAt(receipt.lastReturnedItem.borrowedAt)
                  : "No borrow record found"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Unreturned Item Table
              </p>
              <p className="text-sm text-muted-foreground">
                Remaining borrowed items after this confirmed return.
              </p>
            </div>

            <ReceiptItemsTable
              items={receipt.items}
              isLoading={false}
              emptyTitle="All items returned"
              emptyDescription="This borrower has no remaining borrowed items after this return."
            />
          </section>

          <DialogFooter className="flex-col-reverse sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>
              Done
            </Button>
            <Button type="button" onClick={onContinue}>
              Return Another Tool
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function ReceiptMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl bg-background/80 px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
