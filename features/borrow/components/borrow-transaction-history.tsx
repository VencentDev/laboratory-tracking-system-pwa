"use client";

import { useMemo, useState } from "react";
import { ArrowDownUpIcon, SearchIcon, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { DateRangeValue } from "@/core/lib/date-range";
import { isDateWithinRange } from "@/core/lib/date-range";
import { Button } from "@/core/ui/button";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { DateRangeFilter } from "@/core/ui/date-range-filter";
import { Input } from "@/core/ui/input";
import { TablePagination } from "@/core/ui/table-pagination";
import {
  formatRecordedAt,
  formatTransactionType,
  getTransactionTypeClasses,
} from "@/features/borrow/lib/borrow-formatters";
import type { TransactionRecord } from "@/features/borrow/types";

type BorrowTransactionHistoryProps = {
  isLoading: boolean;
  transactions: TransactionRecord[];
};

const PAGE_SIZE = 10;

export function BorrowTransactionHistory({ isLoading, transactions }: BorrowTransactionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"all" | "borrowed" | "returned">("all");

  function handleDateRangeChange(nextDateRange: DateRangeValue) {
    setCurrentPage(1);
    setDateRange(nextDateRange);
  }

  function handleBorrowerSearchChange(value: string) {
    setCurrentPage(1);
    setBorrowerSearch(value);
  }

  const filteredTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => isDateWithinRange(transaction.recordedAt, dateRange))
        .filter((transaction) => {
          if (borrowerSearch.trim() === "") return true;
          const searchLower = borrowerSearch.toLowerCase();
          return (
            transaction.borrowerName.toLowerCase().includes(searchLower) ||
            transaction.toolName.toLowerCase().includes(searchLower) ||
            transaction.barcode.toLowerCase().includes(searchLower)
          );
        })
        .filter((transaction) =>
          transactionTypeFilter === "all" ? true : transaction.transactionType === transactionTypeFilter,
        )
        .sort((leftTransaction, rightTransaction) => {
          const difference = leftTransaction.recordedAt.getTime() - rightTransaction.recordedAt.getTime();

          return sortDirection === "asc" ? difference : -difference;
        }),
    [dateRange, sortDirection, transactions, borrowerSearch, transactionTypeFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedTransactions = filteredTransactions.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
        No transactions are available yet. Use the scanner modal to start recording borrow activity.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* --- Filter Container --- */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          
          {/* Search input */}
          <div className="relative w-full flex-1 sm:min-w-[250px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by borrower, tool, or barcode..."
              value={borrowerSearch}
              onChange={(e) => handleBorrowerSearchChange(e.target.value)}
              className="pl-9 pr-10 h-10 w-full bg-background"
            />
            {borrowerSearch && (
              <button
                onClick={() => handleBorrowerSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Date range picker */}
          <div className="w-full flex-1 sm:min-w-[300px]">
            <DateRangeFilter
              title="Transaction Date"
              value={dateRange}
              onChange={handleDateRangeChange}
              className="h-10 w-full bg-background"
              boxed={false}
              showTitle={false}
            />
          </div>

          {/* Transaction type filters */}
          <div className="flex w-full flex-1 items-center gap-2 sm:min-w-[300px]">
            <Button
              type="button"
              variant={transactionTypeFilter === "all" ? "default" : "outline"}
              size="sm"
              className={`flex-1 h-10 ${transactionTypeFilter !== "all" ? "bg-background" : ""}`}
              onClick={() => {
                setCurrentPage(1);
                setTransactionTypeFilter("all");
              }}
            >
              All
            </Button>
            <Button
              type="button"
              variant={transactionTypeFilter === "borrowed" ? "default" : "outline"}
              size="sm"
              className={`flex-1 h-10 ${transactionTypeFilter !== "borrowed" ? "bg-background" : ""}`}
              onClick={() => {
                setCurrentPage(1);
                setTransactionTypeFilter("borrowed");
              }}
            >
              Borrowed
            </Button>
            <Button
              type="button"
              variant={transactionTypeFilter === "returned" ? "default" : "outline"}
              size="sm"
              className={`flex-1 h-10 ${transactionTypeFilter !== "returned" ? "bg-background" : ""}`}
              onClick={() => {
                setCurrentPage(1);
                setTransactionTypeFilter("returned");
              }}
            >
              Returned
            </Button>
          </div>
        </div>
      </div>
      {/* --- End Filter Container --- */}

      {!filteredTransactions.length ? (
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No transactions match the selected date range.
        </div>
      ) : null}

      {filteredTransactions.length ? (
        <DataTableSurface>
          <DataTable className="min-w-[760px]">
            <thead>
              <tr>
                <DataTableHeaderCell>Barcode</DataTableHeaderCell>
                <DataTableHeaderCell>Tool</DataTableHeaderCell>
                <DataTableHeaderCell>Action</DataTableHeaderCell>
                <DataTableHeaderCell>Borrower</DataTableHeaderCell>
                <DataTableHeaderCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-mx-1 h-auto gap-1.5 px-1 py-0 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"))}
                  >
                    Date
                    <ArrowDownUpIcon className="h-4 w-4" />
                  </Button>
                </DataTableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <DataTableCell className="font-mono">{transaction.barcode}</DataTableCell>
                  <DataTableCell className="font-medium text-foreground">{transaction.toolName}</DataTableCell>
                  <DataTableCell>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getTransactionTypeClasses(transaction.transactionType)}`}
                    >
                      {formatTransactionType(transaction.transactionType)}
                    </span>
                  </DataTableCell>
                  <DataTableCell>{transaction.borrowerName}</DataTableCell>
                  <DataTableCell>{formatRecordedAt(transaction.recordedAt)}</DataTableCell>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableSurface>
      ) : null}

      {filteredTransactions.length ? (
        <TablePagination
          currentPage={visiblePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </div>
  );
}