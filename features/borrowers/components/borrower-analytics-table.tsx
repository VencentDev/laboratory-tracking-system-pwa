"use client";

import { useMemo, useState } from "react";
import { ArrowDownUpIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { DateRangeValue } from "@/core/lib/date-range";
import { Button } from "@/core/ui/button";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { DateRangeFilter } from "@/core/ui/date-range-filter";
import { TablePagination } from "@/core/ui/table-pagination";
import { BorrowerAvatar } from "@/features/borrowers/components/borrower-avatar";
import {
  formatBorrowedActivityDate,
  getBorrowerAnalyticsRowsForFilter,
  type BorrowerAnalyticsRow,
  type BorrowerLogFilter,
  type BorrowerLogSortDirection,
} from "@/features/borrowers/lib/borrower-analytics";

type BorrowerAnalyticsTableProps = {
  filter: BorrowerLogFilter;
  onFilterChange: (filter: BorrowerLogFilter) => void;
  rows: BorrowerAnalyticsRow[];
  isLoading: boolean;
};

const filterOptions: Array<{ value: BorrowerLogFilter; label: string }> = [
  { value: "most-returned", label: "Most Returned" },
  { value: "not-returned-yet", label: "Not Returned Yet" },
  { value: "overall-borrowed", label: "Overall Borrowed" },
];

const PAGE_SIZE = 10;

export function BorrowerAnalyticsTable({
  filter,
  onFilterChange,
  rows,
  isLoading,
}: BorrowerAnalyticsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [lastActivitySortDirection, setLastActivitySortDirection] = useState<BorrowerLogSortDirection>("desc");
  const [activityDateRange, setActivityDateRange] = useState<DateRangeValue>({});

  function handleFilterChange(nextFilter: BorrowerLogFilter) {
    setCurrentPage(1);
    onFilterChange(nextFilter);
  }

  function handleActivityDateRangeChange(nextDateRange: DateRangeValue) {
    setCurrentPage(1);
    setActivityDateRange(nextDateRange);
  }

  const filteredRows = useMemo(
    () => getBorrowerAnalyticsRowsForFilter(rows, filter, lastActivitySortDirection, activityDateRange),
    [activityDateRange, filter, lastActivitySortDirection, rows],
  );
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedRows = filteredRows.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={option.value === filter ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <DateRangeFilter
          title="Last Activity"
          value={activityDateRange}
          onChange={handleActivityDateRangeChange}
          className="xl:min-w-[380px]"
          boxed={false}
          showTitle={false}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <DataTableSurface>
            <DataTable className="min-w-[1080px]">
              <thead>
                <tr>
                  <DataTableHeaderCell className="text-left">Borrower</DataTableHeaderCell>
                  <DataTableHeaderCell>Type</DataTableHeaderCell>
                  <DataTableHeaderCell>Program / Section</DataTableHeaderCell>
                  <DataTableHeaderCell>Borrowed</DataTableHeaderCell>
                  <DataTableHeaderCell>Returned</DataTableHeaderCell>
                  <DataTableHeaderCell>Outstanding</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-left">Item Borrowed</DataTableHeaderCell>
                  <DataTableHeaderCell>Last Activity</DataTableHeaderCell>
                </tr>
              </thead>
            </DataTable>
          </DataTableSurface>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : !filteredRows.length ? (
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No borrower activity matches this report view yet.
        </div>
      ) : (
        <div className="space-y-4">
          <DataTableSurface>
            <DataTable className="min-w-[1080px]">
              <thead>
                <tr>
                  <DataTableHeaderCell className="text-left">Borrower</DataTableHeaderCell>
                  <DataTableHeaderCell>Type</DataTableHeaderCell>
                  <DataTableHeaderCell>Program / Section</DataTableHeaderCell>
                  <DataTableHeaderCell>Borrowed</DataTableHeaderCell>
                  <DataTableHeaderCell>Returned</DataTableHeaderCell>
                  <DataTableHeaderCell>Outstanding</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-left">Item Borrowed</DataTableHeaderCell>
                  <DataTableHeaderCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-mx-1 h-auto gap-1.5 px-1 py-0 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground hover:bg-transparent hover:text-foreground"
                      onClick={() =>
                        setLastActivitySortDirection((currentDirection) =>
                          currentDirection === "asc" ? "desc" : "asc",
                        )
                      }
                    >
                      Last Activity
                      <ArrowDownUpIcon className="h-4 w-4" />
                    </Button>
                  </DataTableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.borrower.id}>
                    <DataTableCell className="text-left">
                      <div className="flex min-w-0 items-center justify-start gap-3">
                        <BorrowerAvatar className="h-8 w-8 shrink-0 text-[10px]" image={row.borrower.image} name={row.borrower.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">{row.borrower.name}</div>
                          <div className="truncate text-muted-foreground">{row.borrower.schoolId}</div>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="capitalize">{row.borrower.type}</DataTableCell>
                    <DataTableCell>
                      {row.borrower.program || "N/A"}
                      {row.borrower.section ? ` / ${row.borrower.section}` : ""}
                    </DataTableCell>
                    <DataTableCell>{row.borrowedCount}</DataTableCell>
                    <DataTableCell>{row.returnedCount}</DataTableCell>
                    <DataTableCell>{row.outstandingCount}</DataTableCell>
                    <DataTableCell className="text-left">
                      {row.latestBorrowedToolName ?? "--"}
                    </DataTableCell>
                    <DataTableCell>{row.latestActivityAt ? formatBorrowedActivityDate(row.latestActivityAt) : "--"}</DataTableCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </DataTableSurface>

          <TablePagination
            currentPage={visiblePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
