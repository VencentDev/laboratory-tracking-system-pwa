import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/core/lib/utils";
import { Card, CardContent, CardDescription, CardHeader } from "@/core/ui/card";

export type SummaryRankingRow = {
  id: string;
  label: string;
  secondary?: string;
  value: string | number;
  progressValue?: number;
  leading?: ReactNode;
};

type SummaryMetricCardProps = {
  label: string;
  value: string | number;
  subtitle: string;
  className?: string;
};

export function SummaryMetricCard({
  label,
  value,
  subtitle,
  className,
}: SummaryMetricCardProps) {
  return (
    <Card className={cn("min-h-full transition-colors hover:border-foreground/10", className)}>
      <CardHeader className="space-y-3 px-5 pb-2 pt-5">
        <CardDescription className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/90">
          {label}
        </CardDescription>
        <div className="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">{value}</div>
      </CardHeader>
      <CardContent className="px-5 pb-5 text-sm leading-6 text-muted-foreground">{subtitle}</CardContent>
    </Card>
  );
}

type SummaryRankingCardProps = {
  title: string;
  rows: SummaryRankingRow[];
  emptyState: string;
  className?: string;
};

export function SummaryRankingCard({
  title,
  rows,
  emptyState,
  className,
}: SummaryRankingCardProps) {
  return (
    <Card className={cn("transition-colors hover:border-foreground/10", className)}>
      <CardHeader className="px-5 pb-2 pt-5">
        <CardDescription className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/90">
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {rows.length ? (
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={row.id}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {row.leading ? <div className="shrink-0">{row.leading}</div> : null}
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">
                        {row.label}
                        {row.secondary ? (
                          <span className="font-normal text-muted-foreground"> ({row.secondary})</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-foreground">{row.value}</div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/80"
                    style={{ width: `${getRowProgressWidth(row, index, rows)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">{emptyState}</div>
        )}
      </CardContent>
    </Card>
  );
}

type SummaryMetricCardSkeletonProps = {
  className?: string;
};

export function SummaryMetricCardSkeleton({
  className,
}: SummaryMetricCardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-3 px-5 pb-2 pt-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-24" />
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

type SummaryRankingCardSkeletonProps = {
  className?: string;
};

export function SummaryRankingCardSkeleton({
  className,
}: SummaryRankingCardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="px-5 pb-2 pt-5">
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="space-y-2.5 px-5 pb-5">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
        <Skeleton className="h-8 w-4/6" />
      </CardContent>
    </Card>
  );
}

function getRowProgressWidth(
  row: SummaryRankingRow,
  index: number,
  rows: SummaryRankingRow[],
) {
  const numericValues = rows
    .map((item) => item.progressValue ?? (typeof item.value === "number" ? item.value : null))
    .filter((value): value is number => value !== null);

  const rowProgressValue = row.progressValue ?? (typeof row.value === "number" ? row.value : null);

  if (rowProgressValue !== null && numericValues.length) {
    const maxValue = Math.max(...numericValues);

    if (maxValue <= 0) {
      return 100;
    }

    return (rowProgressValue / maxValue) * 100;
  }

  return index === 0 ? 100 : index === 1 ? 80 : 60;
}
