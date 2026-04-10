import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "@/core/lib/utils";

export function DataTableSurface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-[calc(var(--radius-xl)+2px)] border border-border/70 bg-card/90 shadow-soft",
        className,
      )}
      {...props}
    />
  );
}

export function DataTable({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full min-w-full border-collapse text-sm [&_tbody_tr:last-child_td]:border-b-0", className)}
      {...props}
    />
  );
}

export function DataTableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-border/70 bg-muted/50 px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function DataTableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-border/60 px-4 py-4 align-middle text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
