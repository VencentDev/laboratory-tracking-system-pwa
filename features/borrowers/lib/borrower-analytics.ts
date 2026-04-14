import type { DateRangeValue } from "@/core/lib/date-range";
import { isDateWithinRange } from "@/core/lib/date-range";
import type { TransactionRecord } from "@/features/borrow/types";
import type { BorrowerProfile } from "@/features/borrowers/types";

export type BorrowerLogFilter = "most-returned" | "not-returned-yet" | "overall-borrowed";
export type BorrowerLogSortDirection = "asc" | "desc";

export type BorrowerAnalyticsRow = {
  borrower: BorrowerProfile;
  borrowedCount: number;
  returnedCount: number;
  outstandingCount: number;
  latestBorrowedToolName: string | null;
  latestBorrowedAt: Date | null;
  latestActivityAt: Date | null;
};

export type BorrowerAnalyticsSummary = {
  trackedBorrowers: number;
  activeBorrowers: number;
  totalBorrowed: number;
  totalReturned: number;
};

export function buildBorrowerAnalytics(
  borrowers: BorrowerProfile[],
  transactions: TransactionRecord[],
): BorrowerAnalyticsRow[] {
  return borrowers.map((borrower) => {
    const borrowerTransactions = transactions.filter(
      (transaction) =>
        transaction.borrowerSchoolId === borrower.schoolId ||
        (!transaction.borrowerSchoolId && transaction.borrowerName === borrower.name),
    );
    const borrowedCount = borrowerTransactions.filter((transaction) => transaction.transactionType === "borrowed").length;
    const returnedCount = borrowerTransactions.filter((transaction) => transaction.transactionType === "returned").length;
    const outstandingCount = Math.max(0, borrowedCount - returnedCount);
    const latestActivityTransaction = [...borrowerTransactions]
      .sort((leftTransaction, rightTransaction) => rightTransaction.recordedAt.getTime() - leftTransaction.recordedAt.getTime())[0];
    const latestBorrowTransaction = borrowerTransactions
      .filter((transaction) => transaction.transactionType === "borrowed")
      .sort((leftTransaction, rightTransaction) => rightTransaction.recordedAt.getTime() - leftTransaction.recordedAt.getTime())[0];

    return {
      borrower,
      borrowedCount,
      returnedCount,
      outstandingCount,
      latestBorrowedToolName: latestBorrowTransaction?.toolName ?? null,
      latestBorrowedAt: latestBorrowTransaction?.recordedAt ?? null,
      latestActivityAt: latestActivityTransaction?.recordedAt ?? null,
    };
  });
}

export function buildBorrowerAnalyticsSummary(rows: BorrowerAnalyticsRow[]): BorrowerAnalyticsSummary {
  const trackedRows = rows.filter((row) => row.borrowedCount > 0 || row.returnedCount > 0);

  return {
    trackedBorrowers: trackedRows.length,
    activeBorrowers: trackedRows.filter((row) => row.outstandingCount > 0).length,
    totalBorrowed: trackedRows.reduce((total, row) => total + row.borrowedCount, 0),
    totalReturned: trackedRows.reduce((total, row) => total + row.returnedCount, 0),
  };
}

export function getBorrowerAnalyticsRowsForFilter(
  rows: BorrowerAnalyticsRow[],
  filter: BorrowerLogFilter,
  lastActivitySortDirection: BorrowerLogSortDirection = "desc",
  dateRange: DateRangeValue = {},
): BorrowerAnalyticsRow[] {
  const sortByLastActivity = (leftRow: BorrowerAnalyticsRow, rightRow: BorrowerAnalyticsRow) => {
    if (!leftRow.latestActivityAt && !rightRow.latestActivityAt) {
      return leftRow.borrower.name.localeCompare(rightRow.borrower.name);
    }

    if (!leftRow.latestActivityAt) {
      return 1;
    }

    if (!rightRow.latestActivityAt) {
      return -1;
    }

    const difference = leftRow.latestActivityAt.getTime() - rightRow.latestActivityAt.getTime();

    return lastActivitySortDirection === "asc"
      ? difference || leftRow.borrower.name.localeCompare(rightRow.borrower.name)
      : -difference || leftRow.borrower.name.localeCompare(rightRow.borrower.name);
  };

  if (filter === "most-returned") {
    return rows
      .filter((row) => isDateWithinRange(row.latestActivityAt, dateRange))
      .filter((row) => row.returnedCount > 0)
      .sort(sortByLastActivity);
  }

  if (filter === "not-returned-yet") {
    return rows
      .filter((row) => isDateWithinRange(row.latestActivityAt, dateRange))
      .filter((row) => row.outstandingCount > 0)
      .sort(sortByLastActivity);
  }

  return rows
    .filter((row) => isDateWithinRange(row.latestActivityAt, dateRange))
    .filter((row) => row.borrowedCount > 0)
    .sort(sortByLastActivity);
}

export function formatBorrowedActivityDate(date: Date | null) {
  return date ? `${date.toISOString().slice(0, 16).replace("T", " ")} UTC` : "No activity yet";
}
