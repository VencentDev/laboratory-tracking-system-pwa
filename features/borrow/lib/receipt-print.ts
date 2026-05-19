import type {
  BatchBorrowSession,
  BatchReturnSession,
  ReceiptItem,
} from "@/features/borrow/types";

const RECEIPT_WIDTH = 32;
const PRINT_ROOT_ID = "receipt-print-root";
const PRINT_STYLE_ID = "receipt-print-style";
const DEFAULT_BRIDGE_URL = "http://localhost:9321";
const BRIDGE_TIMEOUT_MS = 2500;

export type ReceiptPrintResult = {
  method: "bridge" | "browser" | "none";
  fallbackReason?: string;
};

export async function printBorrowReceipt(session: BatchBorrowSession): Promise<ReceiptPrintResult> {
  return printReceipt(buildBorrowReceiptText(session), "borrow");
}

export async function printReturnReceipt(session: BatchReturnSession): Promise<ReceiptPrintResult> {
  return printReceipt(buildReturnReceiptText(session), "return");
}

export function buildBorrowReceiptText(session: BatchBorrowSession): string {
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

export function buildReturnReceiptText(session: BatchReturnSession): string {
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

async function printReceipt(
  receiptText: string,
  receiptType: "borrow" | "return",
): Promise<ReceiptPrintResult> {
  if (isBridgePrintEnabled()) {
    const bridgeResult = await tryBridgePrint(receiptText, receiptType);

    if (bridgeResult.ok) {
      return { method: "bridge" };
    }

    printBrowserReceipt(receiptText);
    return { method: "browser", fallbackReason: bridgeResult.error };
  }

  printBrowserReceipt(receiptText);
  return { method: "browser" };
}

async function tryBridgePrint(
  receiptText: string,
  receiptType: "borrow" | "return",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), BRIDGE_TIMEOUT_MS);

  try {
    const response = await fetch(`${getBridgeUrl()}/print`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController.signal,
      body: JSON.stringify({
        receiptType,
        content: receiptText,
      }),
    });

    if (!response.ok) {
      return { ok: false, error: `Bridge returned HTTP ${response.status}` };
    }

    const payload: unknown = await response.json();

    if (isBridgeSuccess(payload)) {
      return { ok: true };
    }

    return {
      ok: false,
      error: isBridgeError(payload) ? payload.error : "Bridge rejected the print job",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not reach the print bridge",
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function printBrowserReceipt(receiptText: string): void {
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

function isBridgePrintEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("receiptPrintMode") !== "browser";
}

function getBridgeUrl(): string {
  if (typeof window === "undefined") {
    return DEFAULT_BRIDGE_URL;
  }

  const localBridgeUrl = window.localStorage.getItem("receiptPrintBridgeUrl");
  const envBridgeUrl = process.env.NEXT_PUBLIC_PRINT_BRIDGE_URL;

  return (localBridgeUrl || envBridgeUrl || DEFAULT_BRIDGE_URL).replace(/\/$/, "");
}

function isBridgeSuccess(payload: unknown): payload is { ok: true } {
  return typeof payload === "object" && payload !== null && "ok" in payload && payload.ok === true;
}

function isBridgeError(payload: unknown): payload is { ok: false; error: string } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "ok" in payload &&
    payload.ok === false &&
    "error" in payload &&
    typeof payload.error === "string"
  );
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
