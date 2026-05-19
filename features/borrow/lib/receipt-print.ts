import type {
  BatchBorrowSession,
  BatchReturnSession,
  ReceiptItem,
} from "@/features/borrow/types";

const RECEIPT_WIDTH = 32;
const PRINT_ROOT_ID = "receipt-print-root";
const PRINT_STYLE_ID = "receipt-print-style";

export function printBorrowReceipt(session: BatchBorrowSession): void {
  printReceipt(buildBorrowReceipt(session));
}

export function printReturnReceipt(session: BatchReturnSession): void {
  printReceipt(buildReturnReceipt(session));
}

function buildBorrowReceipt(session: BatchBorrowSession): string {
  return [
    line(),
    center("LAB TRACKING SYSTEM"),
    center("BORROW RECEIPT"),
    line(),
    field("Borrower", session.borrowerName),
    field("School ID", session.borrowerSchoolId ?? "N/A"),
    field("Date", formatReceiptDate(new Date())),
    dash(),
    " # ITEM              BARCODE",
    ...session.items.map((item, index) => itemLine(index + 1, item)),
    dash(),
    `Total Items: ${session.items.length}`,
    line(),
  ].join("\n");
}

function buildReturnReceipt(session: BatchReturnSession): string {
  return [
    line(),
    center("LAB TRACKING SYSTEM"),
    center("RETURN RECEIPT"),
    line(),
    field("Borrower", session.borrowerName),
    field("School ID", session.borrowerSchoolId ?? "N/A"),
    field("Date", formatReceiptDate(new Date())),
    dash(),
    "RETURNED ITEMS",
    ...session.returnedItems.map((item, index) => itemLine(index + 1, item)),
    dash(),
    "STILL UNRETURNED",
    ...session.unreturnedItems.map((item, index) => itemLine(index + 1, item)),
    line(),
  ].join("\n");
}

function printReceipt(receiptText: string): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  let root = document.getElementById(PRINT_ROOT_ID);

  if (!root) {
    root = document.createElement("div");
    root.id = PRINT_ROOT_ID;
    document.body.appendChild(root);
  }

  root.innerHTML = "";
  const receipt = document.createElement("div");
  receipt.className = "receipt-print-paper";
  receipt.textContent = receiptText;
  root.appendChild(receipt);
  injectPrintStyle();
  window.print();
}

function injectPrintStyle(): void {
  let style = document.getElementById(PRINT_STYLE_ID);

  if (!style) {
    style = document.createElement("style");
    style.id = PRINT_STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    #${PRINT_ROOT_ID} {
      height: 0;
      left: -10000px;
      overflow: hidden;
      position: fixed;
      top: 0;
      width: 0;
    }

    @page {
      size: 58mm auto;
      margin: 0;
    }

    @media print {
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }

      body > :not(#${PRINT_ROOT_ID}) {
        display: none !important;
      }

      #${PRINT_ROOT_ID} {
        display: block !important;
        position: fixed !important;
        inset: 0 auto auto 0 !important;
        width: 58mm !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: white !important;
        color: black !important;
        z-index: 9999 !important;
      }

      .receipt-print-paper {
        width: 58mm !important;
        box-sizing: border-box !important;
        padding: 2mm !important;
        background: white !important;
        color: black !important;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
        font-size: 10px !important;
        line-height: 1.35 !important;
        white-space: pre !important;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  `;
}

function line(): string {
  return "=".repeat(RECEIPT_WIDTH);
}

function dash(): string {
  return "-".repeat(RECEIPT_WIDTH);
}

function center(value: string): string {
  const padding = Math.max(0, RECEIPT_WIDTH - value.length);
  const left = Math.floor(padding / 2);
  return `${" ".repeat(left)}${value}`;
}

function field(label: string, value: string): string {
  return `${label.padEnd(9, " ")}: ${truncate(value, RECEIPT_WIDTH - 11)}`;
}

function itemLine(index: number, item: ReceiptItem): string {
  return `${String(index).padStart(2, " ")} ${truncate(item.toolName, 16).padEnd(16, " ")} ${truncate(item.barcode, 9)}`;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function formatReceiptDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
