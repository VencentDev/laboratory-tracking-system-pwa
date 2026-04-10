"use client";

import { useMemo, useState } from "react";
import { ArrowDownUpIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { DateRangeValue } from "@/core/lib/date-range";
import { isDateWithinRange } from "@/core/lib/date-range";
import { Button } from "@/core/ui/button";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { DateRangeFilter } from "@/core/ui/date-range-filter";
import { TablePagination } from "@/core/ui/table-pagination";
import { ToolTableFilters } from "@/features/inventory/components/tool-table-filters";
import type { TransactionRecord } from "@/features/borrow/types";
import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import type { ToolProfile } from "@/features/inventory/types";
import type { Option } from "@/core/ui/multiple-selector";

type ItemLogHistoryTableProps = {
  isLoading: boolean;
  tools: ToolProfile[];
  transactions: TransactionRecord[];
};

const PAGE_SIZE = 10;

export function ItemLogHistoryTable({
  isLoading,
  tools,
  transactions,
}: ItemLogHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<Option[]>([]);
  const [borrowedDateRange, setBorrowedDateRange] = useState<DateRangeValue>({});
  const [borrowedDateSortDirection, setBorrowedDateSortDirection] = useState<"asc" | "desc">("desc");

  function handleCategoryChange(nextCategoryFilter: Option[]) {
    setCurrentPage(1);
    setCategoryFilter(nextCategoryFilter);
  }

  function handleBorrowedDateRangeChange(nextDateRange: DateRangeValue) {
    setCurrentPage(1);
    setBorrowedDateRange(nextDateRange);
  }

  const latestBorrowDetailsByBarcode = useMemo(() => {
    const borrowDetails = new Map<string, { recordedAt: Date; borrowerName: string }>();

    for (const transaction of transactions) {
      if (transaction.transactionType !== "borrowed") {
        continue;
      }

      const currentBorrowDetail = borrowDetails.get(transaction.barcode);

      if (!currentBorrowDetail || transaction.recordedAt > currentBorrowDetail.recordedAt) {
        borrowDetails.set(transaction.barcode, {
          recordedAt: transaction.recordedAt,
          borrowerName: transaction.borrowerName,
        });
      }
    }

    return borrowDetails;
  }, [transactions]);
  const borrowedTools = useMemo(
    () => tools.filter((tool) => tool.currentStatus === "borrowed"),
    [tools],
  );
  const filteredTools = useMemo(
    () =>
      borrowedTools.filter((tool) => {
        const selectedCategoryValues = categoryFilter.map((option) => option.value);
        return (
          selectedCategoryValues.length === 0
            ? true
            : selectedCategoryValues.some((value) =>
                value === "__uncategorized__"
                  ? !tool.category?.trim()
                  : tool.category?.trim().toLowerCase() === value.toLowerCase(),
              )
        ) && isDateWithinRange(latestBorrowDetailsByBarcode.get(tool.barcode)?.recordedAt, borrowedDateRange);
      }),
    [borrowedTools, categoryFilter, borrowedDateRange, latestBorrowDetailsByBarcode],
  );
  const sortedFilteredTools = useMemo(() => {
    return [...filteredTools].sort((leftTool, rightTool) => {
      const leftBorrowDetail = latestBorrowDetailsByBarcode.get(leftTool.barcode);
      const rightBorrowDetail = latestBorrowDetailsByBarcode.get(rightTool.barcode);

      if (!leftBorrowDetail && !rightBorrowDetail) {
        return leftTool.name.localeCompare(rightTool.name);
      }

      if (!leftBorrowDetail) {
        return 1;
      }

      if (!rightBorrowDetail) {
        return -1;
      }

      const difference = leftBorrowDetail.recordedAt.getTime() - rightBorrowDetail.recordedAt.getTime();

      return borrowedDateSortDirection === "asc" ? difference : -difference;
    });
  }, [borrowedDateSortDirection, filteredTools, latestBorrowDetailsByBarcode]);
  const totalPages = Math.max(1, Math.ceil(sortedFilteredTools.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedTools = sortedFilteredTools.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!borrowedTools.length) {
    return (
      <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
        No borrowed items are available yet. Borrow a tool to populate this log.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="min-w-0 flex-1">
          <ToolTableFilters
            tools={borrowedTools}
            categoryFilter={categoryFilter}
            onCategoryChange={handleCategoryChange}
            showStatus={false}
          />
        </div>
        <DateRangeFilter
          title="Borrowed Date"
          value={borrowedDateRange}
          onChange={handleBorrowedDateRangeChange}
          className="xl:min-w-[380px]"
          boxed={false}
          showTitle={false}
        />
      </div>

      {!sortedFilteredTools.length ? (
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No borrowed items match the selected filters.
        </div>
      ) : null}

      {sortedFilteredTools.length ? (
        <DataTableSurface>
          <DataTable className="min-w-[760px]">
            <thead>
              <tr>
                <DataTableHeaderCell>Barcode</DataTableHeaderCell>
                <DataTableHeaderCell>Name</DataTableHeaderCell>
                <DataTableHeaderCell>Category</DataTableHeaderCell>
                <DataTableHeaderCell>Borrower</DataTableHeaderCell>
                <DataTableHeaderCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-mx-1 h-auto gap-1.5 px-1 py-0 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() =>
                      setBorrowedDateSortDirection((currentDirection) =>
                        currentDirection === "asc" ? "desc" : "asc",
                      )
                    }
                  >
                    Borrowed Date
                    <ArrowDownUpIcon className="h-4 w-4" />
                  </Button>
                </DataTableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {paginatedTools.map((tool) => (
                <tr key={tool.id}>
                  <DataTableCell className="font-mono">{tool.barcode}</DataTableCell>
                  <DataTableCell className="font-medium text-foreground">{tool.name}</DataTableCell>
                  <DataTableCell>{tool.category || "Uncategorized"}</DataTableCell>
                  <DataTableCell>
                    {latestBorrowDetailsByBarcode.get(tool.barcode)?.borrowerName ?? "--"}
                  </DataTableCell>
                  <DataTableCell>
                    {latestBorrowDetailsByBarcode.get(tool.barcode)
                      ? formatRecordedAt(latestBorrowDetailsByBarcode.get(tool.barcode)?.recordedAt as Date)
                      : "--"}
                  </DataTableCell>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableSurface>
      ) : null}

      {sortedFilteredTools.length ? (
        <TablePagination
          currentPage={visiblePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </div>
  );
}
