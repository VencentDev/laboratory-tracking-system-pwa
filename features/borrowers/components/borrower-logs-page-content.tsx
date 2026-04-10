"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/core/ui/page-header";
import { BorrowerAnalyticsSummaryCards } from "@/features/borrowers/components/borrower-analytics-summary-cards";
import { BorrowerAnalyticsTable } from "@/features/borrowers/components/borrower-analytics-table";
import { useTransactions } from "@/features/borrow/hooks/use-borrow";
import { useBorrowers } from "@/features/borrowers/hooks/use-borrower";
import {
  buildBorrowerAnalytics,
  buildBorrowerAnalyticsSummary,
  type BorrowerLogFilter,
} from "@/features/borrowers/lib/borrower-analytics";

export function BorrowerLogsPageContent() {
  const [filter, setFilter] = useState<BorrowerLogFilter>("overall-borrowed");
  const { data: borrowers, isLoading: isBorrowersLoading } = useBorrowers();
  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions();

  const isLoading = isBorrowersLoading || isTransactionsLoading;
  const borrowerAnalyticsRows = useMemo(
    () => buildBorrowerAnalytics(borrowers ?? [], transactions ?? []),
    [borrowers, transactions],
  );
  const borrowerAnalyticsSummary = useMemo(
    () => buildBorrowerAnalyticsSummary(borrowerAnalyticsRows),
    [borrowerAnalyticsRows],
  );
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Borrowers"
        title="Borrower Activity"
        description="Track borrower behavior with report-friendly summaries, active loans, and return performance in one view."
      />

      <BorrowerAnalyticsSummaryCards isLoading={isLoading} summary={borrowerAnalyticsSummary} />

      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Borrower reports</h2>
          <p className="text-sm text-muted-foreground">
            Switch report views and narrow the date range to inspect specific borrower activity patterns.
          </p>
        </div>
        <BorrowerAnalyticsTable
          filter={filter}
          onFilterChange={setFilter}
          rows={borrowerAnalyticsRows}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
