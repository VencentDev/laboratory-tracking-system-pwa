"use client";

import { useRef } from "react";

import { Button } from "@/core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/ui/dialog";
import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import type { ReturnPreview } from "@/features/borrow/types";

type ReturnReviewDialogProps = {
  pendingReturn: ReturnPreview | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ReturnReviewDialog({
  pendingReturn,
  isSubmitting,
  onCancel,
  onConfirm,
}: ReturnReviewDialogProps) {
  const open = pendingReturn !== null;
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onCancel() : undefined)}>
      {pendingReturn ? (
        <DialogContent
          className="max-w-lg"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            confirmButtonRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Review Returned Item</DialogTitle>
            <DialogDescription>
              Confirm the borrower handed back the correct item before we record this return.
            </DialogDescription>
          </DialogHeader>

          <dl className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="Item Name" value={pendingReturn.toolName} />
            <DetailRow label="Barcode" value={pendingReturn.barcode} />
            <DetailRow label="Status" value={formatReturnStatus(pendingReturn.currentStatus)} />
            <DetailRow label="Borrower" value={pendingReturn.borrowerName} />
            <DetailRow label="Category" value={pendingReturn.category ?? "Uncategorized"} />
            <DetailRow
              label="Last Borrowed"
              value={
                pendingReturn.lastBorrowedAt
                  ? formatRecordedAt(pendingReturn.lastBorrowedAt)
                  : "No borrow record found"
              }
            />
          </dl>

          {pendingReturn.description ? (
            <div className="space-y-1 rounded-2xl border border-border/50 bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Description
              </p>
              <p className="text-sm leading-6 text-foreground">{pendingReturn.description}</p>
            </div>
          ) : null}

          <DialogFooter className="flex-col-reverse sm:flex-row">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button ref={confirmButtonRef} type="button" onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Recording return..." : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="space-y-1 rounded-2xl border border-border/50 bg-background/80 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium leading-6 text-foreground">{value}</dd>
    </div>
  );
}

function formatReturnStatus(status: ReturnPreview["currentStatus"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
