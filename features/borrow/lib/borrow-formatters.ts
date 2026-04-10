import type { TransactionRecord } from "@/features/borrow/types";

export const borrowSummaryCards = [
  {
    key: "total",
    label: "Total Transactions",
    subtitle: "All borrow and return records",
  },
  {
    key: "borrowed",
    label: "Items Borrowed",
    subtitle: "Tools checked out to borrowers",
  },
  {
    key: "returned",
    label: "Items Returned",
    subtitle: "Tools brought back into inventory",
  },
] as const;

export function formatTransactionType(transactionType: TransactionRecord["transactionType"]) {
  return transactionType.charAt(0).toUpperCase() + transactionType.slice(1);
}

export function getTransactionTypeClasses(transactionType: TransactionRecord["transactionType"]) {
  return transactionType === "borrowed"
    ? "border-border/80 bg-muted text-foreground/80"
    : transactionType === "returned"
      ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "border-border/80 bg-muted text-muted-foreground";
}

export function formatRecordedAt(recordedAt: Date) {
  const date = new Date(recordedAt);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleDateString("en-US", options);
}

export function getScanErrorMessage(code: string) {
  switch (code) {
    case "NOT_FOUND":
      return "No tool found with this barcode";
    case "NO_BORROWER":
      return "Select a borrower before scanning tools to borrow";
    case "NOT_AVAILABLE_FOR_BORROW":
      return "This item is not available to borrow";
    case "NOT_AVAILABLE_FOR_RETURN":
      return "This item is already available and cannot be returned";
    default:
      return "Transaction could not be recorded. Try again.";
  }
}
