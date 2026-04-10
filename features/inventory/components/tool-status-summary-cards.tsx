"use client";

import {
  SummaryMetricCard,
  SummaryMetricCardSkeleton,
} from "@/core/ui/summary-card";
import type { ToolStatusSummary } from "@/features/inventory/lib/item-log-analytics";

type ToolStatusSummaryCardsProps = {
  isLoading: boolean;
  summary: ToolStatusSummary;
};

const cardMeta = [
  {
    key: "total",
    label: "Total Items",
    subtitle: "All registered laboratory items currently tracked in the system.",
  },
  {
    key: "available",
    label: "Available",
    subtitle: "Ready to be issued or scanned for the next transaction.",
  },
  {
    key: "borrowed",
    label: "Borrowed",
    subtitle: "Currently assigned to a borrower and still in circulation.",
  },
  {
    key: "missing",
    label: "Missing",
    subtitle: "Marked missing and waiting for follow-up or recovery.",
  },
] as const;

export function ToolStatusSummaryCards({
  isLoading,
  summary,
}: ToolStatusSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SummaryMetricCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardMeta.map((card) => (
        <SummaryMetricCard
          key={card.key}
          label={card.label}
          value={summary[card.key]}
          subtitle={card.subtitle}
        />
      ))}
    </div>
  );
}
