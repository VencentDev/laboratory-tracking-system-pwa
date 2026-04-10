"use client";

import {
  SummaryMetricCard,
  SummaryMetricCardSkeleton,
} from "@/core/ui/summary-card";
import type { BorrowerAnalyticsSummary } from "@/features/borrowers/lib/borrower-analytics";

type BorrowerAnalyticsSummaryCardsProps = {
  isLoading: boolean;
  summary: BorrowerAnalyticsSummary;
};

export function BorrowerAnalyticsSummaryCards({
  isLoading,
  summary,
}: BorrowerAnalyticsSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetricCardSkeleton />
        <SummaryMetricCardSkeleton />
        <SummaryMetricCardSkeleton />
        <SummaryMetricCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryMetricCard
        label="Tracked Borrowers"
        value={summary.trackedBorrowers}
        subtitle="Borrowers with at least one recorded transaction."
      />
      <SummaryMetricCard
        label="Active Borrowers"
        value={summary.activeBorrowers}
        subtitle="Borrowers who still have one or more items checked out."
      />
      <SummaryMetricCard
        label="Items Borrowed"
        value={summary.totalBorrowed}
        subtitle="Borrow transactions recorded across all borrower activity."
      />
      <SummaryMetricCard
        label="Items Returned"
        value={summary.totalReturned}
        subtitle="Return transactions recorded for tracked borrower activity."
      />
    </div>
  );
}
