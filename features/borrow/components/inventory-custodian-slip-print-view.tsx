"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";

import {
  CUSTODIAN_SLIP_PRINTING_CLASS,
  createCustodianSlipNumber,
  formatCustodianSlipDate,
} from "@/features/borrow/lib/custodian-slip-print";
import type { BatchBorrowSession, ReceiptItem } from "@/features/borrow/types";
import type { BorrowerProfile } from "@/features/borrowers/types";

type InventoryCustodianSlipPrintViewProps = {
  borrower?: BorrowerProfile | null;
  issuedBy?: string;
  issuedByDetails?: string | null;
  session: BatchBorrowSession;
};

const MIN_ITEM_ROWS = 18;

export function InventoryCustodianSlipPrintView({
  borrower,
  issuedBy = "Laboratory Staff",
  issuedByDetails,
  session,
}: InventoryCustodianSlipPrintViewProps) {
  const issuedAt = useMemo(() => session.items[0]?.borrowedAt ?? new Date(), [session.items]);
  const slipNumber = useMemo(
    () => createCustodianSlipNumber(session, issuedAt),
    [issuedAt, session],
  );
  const itemRows = useMemo(() => createItemRows(session.items), [session.items]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="custodian-slip-print-output" aria-hidden="true">
      <article className="custodian-slip-paper">
        <header className="custodian-slip-title">LABORATORY CUSTODY SLIP</header>

        <table className="custodian-slip-meta-table">
          <tbody>
            <tr>
              <td>
                <span>Laboratory / Department:</span>
                Laboratory Tracking System
              </td>
              <td>
                <span>Slip No.:</span>
                {slipNumber}
              </td>
            </tr>
            <tr>
              <td>
                <span>Borrower / Custodian:</span>
                {session.borrowerName}
              </td>
              <td>
                <span>Date:</span>
                {formatCustodianSlipDate(issuedAt)}
              </td>
            </tr>
            <tr>
              <td>
                <span>School ID:</span>
                {session.borrowerSchoolId ?? "N/A"}
              </td>
              <td>
                <span>Course / Section:</span>
                {formatCourseAndSection(borrower)}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="custodian-slip-items-table">
          <thead>
            <tr>
              <th className="custodian-slip-quantity-column">Quantity</th>
              <th className="custodian-slip-unit-column">Unit</th>
              <th>Item Description</th>
              <th className="custodian-slip-category-column">Category</th>
              <th className="custodian-slip-stock-column">Barcode / Stock No.</th>
            </tr>
          </thead>
          <tbody>
            {itemRows.map((item, index) => (
              <tr key={item ? `${item.toolId}-${item.barcode}` : `empty-${index}`}>
                <td>{item ? "1" : ""}</td>
                <td>{item ? "pc" : ""}</td>
                <td>{item?.toolName ?? ""}</td>
                <td>{item?.category ?? ""}</td>
                <td>{item?.barcode ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="custodian-slip-signatures">
          <div>
            <p className="custodian-slip-signature-label">Received by:</p>
            <div className="custodian-slip-signature-line">{session.borrowerName}</div>
            <p className="custodian-slip-signature-caption">(Signature over Printed Name)</p>
            <p className="custodian-slip-designation">{formatBorrowerDesignation(borrower)}</p>
            <div className="custodian-slip-date-line">Date</div>
          </div>

          <div>
            <p className="custodian-slip-signature-label">Issued by:</p>
            <div className="custodian-slip-signature-line">{issuedBy}</div>
            <p className="custodian-slip-signature-caption">(Signature over Printed Name)</p>
            <p className="custodian-slip-designation">Laboratory Staff / Toolkeeper</p>
            {issuedByDetails ? (
              <p className="custodian-slip-issuer-details">{issuedByDetails}</p>
            ) : null}
            <div className="custodian-slip-date-line">Date</div>
          </div>
        </section>
      </article>

      <style jsx global>{`
        .custodian-slip-print-output {
          display: block;
          height: 0;
          left: -10000px;
          overflow: hidden;
          position: fixed;
          top: 0;
          width: 0;
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body.${CUSTODIAN_SLIP_PRINTING_CLASS} > :not(.custodian-slip-print-output) {
            display: none !important;
          }

          body.${CUSTODIAN_SLIP_PRINTING_CLASS} .custodian-slip-print-output {
            align-items: center !important;
            box-sizing: border-box !important;
            display: flex !important;
            justify-content: center !important;
            position: fixed !important;
            inset: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 12mm !important;
            overflow: hidden !important;
            background: white !important;
            color: black !important;
            z-index: 9999 !important;
          }

          .custodian-slip-paper {
            box-sizing: border-box !important;
            width: 186mm !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            font-family: "Times New Roman", Times, serif !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .custodian-slip-title {
            border: 1px solid #000 !important;
            padding: 3mm 2mm 2.5mm !important;
            text-align: center !important;
            font-size: 15px !important;
            font-weight: 700 !important;
            letter-spacing: 0.04em !important;
          }

          .custodian-slip-paper table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }

          .custodian-slip-paper th,
          .custodian-slip-paper td {
            border: 1px solid #000 !important;
            color: black !important;
            vertical-align: middle !important;
          }

          .custodian-slip-meta-table td {
            height: 6.5mm !important;
            padding: 1mm 1.5mm !important;
          }

          .custodian-slip-meta-table span {
            display: inline-block !important;
            min-width: 34mm !important;
          }

          .custodian-slip-items-table th {
            height: 9mm !important;
            padding: 1mm !important;
            text-align: center !important;
            font-weight: 400 !important;
          }

          .custodian-slip-items-table td {
            height: 7.2mm !important;
            padding: 1mm 1.4mm !important;
          }

          .custodian-slip-items-table td:nth-child(1),
          .custodian-slip-items-table td:nth-child(2),
          .custodian-slip-items-table td:nth-child(4),
          .custodian-slip-items-table td:nth-child(5) {
            text-align: center !important;
          }

          .custodian-slip-quantity-column {
            width: 18mm !important;
          }

          .custodian-slip-unit-column {
            width: 22mm !important;
          }

          .custodian-slip-category-column {
            width: 34mm !important;
          }

          .custodian-slip-stock-column {
            width: 38mm !important;
          }

          .custodian-slip-signatures {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            min-height: 40mm !important;
            border: 1px solid #000 !important;
            border-top: 0 !important;
          }

          .custodian-slip-signatures > div {
            display: flex !important;
            min-height: 40mm !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-end !important;
            padding: 1.5mm 7mm 3mm !important;
          }

          .custodian-slip-signatures > div + div {
            border-left: 1px solid #000 !important;
          }

          .custodian-slip-signature-label {
            align-self: flex-start !important;
            margin: 0 auto auto 0 !important;
          }

          .custodian-slip-signature-line {
            width: 100% !important;
            border-bottom: 1px solid #000 !important;
            padding-bottom: 1mm !important;
            text-align: center !important;
            font-weight: 700 !important;
          }

          .custodian-slip-signature-caption,
          .custodian-slip-designation,
          .custodian-slip-issuer-details,
          .custodian-slip-date-line {
            margin: 1mm 0 0 !important;
            text-align: center !important;
          }

          .custodian-slip-signature-caption {
            font-size: 8px !important;
            font-style: italic !important;
          }

          .custodian-slip-designation {
            min-height: 4mm !important;
          }

          .custodian-slip-issuer-details {
            min-height: 4mm !important;
            font-size: 9px !important;
          }

          .custodian-slip-date-line {
            width: 34mm !important;
            border-top: 1px solid #000 !important;
            padding-top: 1mm !important;
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}

function createItemRows(items: ReceiptItem[]) {
  const rowCount = Math.max(MIN_ITEM_ROWS, items.length);

  return Array.from({ length: rowCount }, (_, index) => items[index] ?? null);
}

function formatBorrowerDesignation(borrower?: BorrowerProfile | null) {
  if (!borrower) {
    return "Borrower / End-User";
  }

  const borrowerType = formatBorrowerType(borrower.type);
  const courseAndSection = formatCourseAndSection(borrower);

  return courseAndSection === "N/A" ? borrowerType : `${borrowerType} - ${courseAndSection}`;
}

function formatBorrowerType(type: BorrowerProfile["type"]) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatCourseAndSection(borrower?: BorrowerProfile | null) {
  if (!borrower) {
    return "N/A";
  }

  const details = [
    borrower.program,
    borrower.yearLevel ? `Year ${borrower.yearLevel}` : null,
    borrower.section ? `Section ${borrower.section}` : null,
  ].filter(Boolean);

  return details.length ? details.join(" / ") : "N/A";
}
