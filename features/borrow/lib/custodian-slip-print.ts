import type { BatchBorrowSession } from "@/features/borrow/types";

export const CUSTODIAN_SLIP_PRINTING_CLASS = "custodian-slip-printing";

export function printCustodianSlip(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return false;
  }

  let hasCleanedUp = false;

  function cleanup() {
    if (hasCleanedUp) {
      return;
    }

    hasCleanedUp = true;
    document.body.classList.remove(CUSTODIAN_SLIP_PRINTING_CLASS);
    window.removeEventListener("afterprint", cleanup);
  }

  document.body.classList.add(CUSTODIAN_SLIP_PRINTING_CLASS);
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 1000);

  return true;
}

export function createCustodianSlipNumber(session: BatchBorrowSession, issuedAt: Date) {
  const dateKey = [
    issuedAt.getFullYear(),
    String(issuedAt.getMonth() + 1).padStart(2, "0"),
    String(issuedAt.getDate()).padStart(2, "0"),
  ].join("");
  const borrowerKey = (session.borrowerSchoolId || session.borrowerId || "NA")
    .replace(/[^a-z0-9]/gi, "")
    .slice(-6)
    .toUpperCase();

  return `LCS-${dateKey}-${borrowerKey || "NA"}`;
}

export function formatCustodianSlipDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
