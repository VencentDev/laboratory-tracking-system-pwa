"use client";

import { SummaryMetricCard, SummaryMetricCardSkeleton } from "@/core/ui/summary-card";
import { borrowSummaryCards } from "@/features/borrow/lib/borrow-formatters";

type BorrowSummaryCardsProps = {
  isLoading: boolean;
  totalTransactions: number;
  borrowedCount: number;
  returnedCount: number;
};

export function BorrowSummaryCards({
  isLoading,
  totalTransactions,
  borrowedCount,
  returnedCount,
}: BorrowSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {isLoading
        ? Array.from({ length: 3 }).map((_, index) => (
            <SummaryMetricCardSkeleton key={index} />
          ))
        : borrowSummaryCards.map((card) => {
            const value =
              card.key === "total"
                ? totalTransactions
                : card.key === "borrowed"
                  ? borrowedCount
                  : returnedCount;

            return (
              <SummaryMetricCard
                key={card.key}
                label={card.label}
                value={value}
                subtitle={card.subtitle}
                className="min-h-full"
              />
            );
          })}
    </div>
  );
}
