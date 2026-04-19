"use client";

import {
  DataTable,
  DataTableCell,
  DataTableHeaderCell,
  DataTableSurface,
} from "@/core/ui/data-table";
import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import type { ReceiptItem } from "@/features/borrow/types";

type ReceiptItemsTableProps = {
  items: ReceiptItem[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  borrowedAtLabel?: string;
};

export function ReceiptItemsTable({
  items,
  isLoading,
  emptyTitle,
  emptyDescription,
  borrowedAtLabel = "Borrowed",
}: ReceiptItemsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-[calc(var(--radius-xl)+2px)] border border-border/45 bg-card/70 px-5 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Loading receipt items...</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pulling the latest borrowed-item list from local storage.
        </p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/45 bg-card/70 px-5 py-10 text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <DataTableSurface className="rounded-2xl border-border/45 bg-card/65 shadow-none">
      <DataTable>
        <thead>
          <tr>
            <DataTableHeaderCell className="border-border/35 bg-muted/25">Tool</DataTableHeaderCell>
            <DataTableHeaderCell className="border-border/35 bg-muted/25">Barcode</DataTableHeaderCell>
            <DataTableHeaderCell className="border-border/35 bg-muted/25">Category</DataTableHeaderCell>
            <DataTableHeaderCell className="border-border/35 bg-muted/25">{borrowedAtLabel}</DataTableHeaderCell>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.toolId}-${item.barcode}-${item.borrowedAt?.toISOString() ?? "receipt-item"}`}>
              <DataTableCell className="border-border/30 font-medium text-foreground">{item.toolName}</DataTableCell>
              <DataTableCell className="border-border/30 font-mono">{item.barcode}</DataTableCell>
              <DataTableCell className="border-border/30">{item.category ?? "Uncategorized"}</DataTableCell>
              <DataTableCell className="border-border/30">
                {item.borrowedAt ? formatRecordedAt(item.borrowedAt) : "No borrow date"}
              </DataTableCell>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </DataTableSurface>
  );
}
