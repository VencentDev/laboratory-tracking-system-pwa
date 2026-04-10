"use client";

import { useMemo } from "react";

import { PageHeader } from "@/core/ui/page-header";
import { useTransactions } from "@/features/borrow/hooks/use-borrow";
import { ItemLogHistoryTable } from "@/features/inventory/components/item-log-history-table";
import { ToolStatusSummaryCards } from "@/features/inventory/components/tool-status-summary-cards";
import { useTools } from "@/features/inventory/hooks/use-tools";
import { buildToolStatusSummary } from "@/features/inventory/lib/item-log-analytics";

export function ItemLogsPageContent() {
  const { data: tools, isLoading } = useTools();
  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions();
  const toolStatusSummary = useMemo(() => buildToolStatusSummary(tools ?? []), [tools]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Item Activity"
        description="Review inventory balance, barcode registration, and the items that are currently out in circulation."
      />

      <ToolStatusSummaryCards isLoading={isLoading} summary={toolStatusSummary} />

      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Borrowed inventory</h2>
          <p className="text-sm text-muted-foreground">
            Filter by category and borrow date to see which items are still checked out.
          </p>
        </div>
        <ItemLogHistoryTable
          isLoading={isLoading || isTransactionsLoading}
          tools={tools ?? []}
          transactions={transactions ?? []}
        />
      </div>
    </div>
  );
}
