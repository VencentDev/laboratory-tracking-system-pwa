"use client";

import { createPortal } from "react-dom";

import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import { ACKNOWLEDGEMENT_REPORT_PRINTING_CLASS } from "@/features/reports/lib/acknowledgement-report-print";
import type { AcknowledgementReportGroup, AcknowledgementReportItem } from "@/features/reports/types";

type AcknowledgementSlipPrintBatchViewProps = {
  reports: AcknowledgementReportGroup[];
  preparedBy?: string;
};

const MIN_ITEM_ROWS = 18;
const ITEMS_PER_PAGE = 18;

export function AcknowledgementSlipPrintBatchView({
  reports,
  preparedBy = "Admin",
}: AcknowledgementSlipPrintBatchViewProps) {
  if (typeof document === "undefined" || reports.length === 0) {
    return null;
  }

  return createPortal(
    <div className="acknowledgement-print-output" aria-hidden="true">
      {reports.flatMap((report) => {
        const pages = paginateItems(report.items);
        const totalPages = pages.length;

        return pages.map((items, pageIndex) => {
          const pageNumber = pageIndex + 1;
          const isLastPage = pageNumber === totalPages;

          return (
            <section className="acknowledgement-print-page" key={`${report.id}-${pageNumber}`}>
              <article className="acknowledgement-slip-paper">
                <header className="acknowledgement-slip-title">LABORATORY ACKNOWLEDGEMENT SLIP</header>

                <table className="acknowledgement-slip-meta-table">
                  <tbody>
                    <tr>
                      <td>
                        <span>Laboratory / Department:</span>
                        Laboratory Tracking System
                      </td>
                      <td>
                        <span>Slip No.:</span>
                        {report.slipNumber}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span>Borrower / Custodian:</span>
                        {report.borrowerName}
                      </td>
                      <td>
                        <span>Coverage:</span>
                        {formatDateRange(report.dateFrom, report.dateTo)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span>School ID:</span>
                        {report.borrowerSchoolId ?? "N/A"}
                      </td>
                      <td>
                        <span>Page:</span>
                        {pageNumber} of {totalPages}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span>Course / Section:</span>
                        {formatCourseAndSection(report)}
                      </td>
                      <td>
                        <span>Total Items:</span>
                        {report.items.length}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="acknowledgement-slip-items-table">
                  <thead>
                    <tr>
                      <th className="acknowledgement-slip-quantity-column">Quantity</th>
                      <th className="acknowledgement-slip-unit-column">Unit</th>
                      <th>Item Description</th>
                      <th className="acknowledgement-slip-category-column">Category</th>
                      <th className="acknowledgement-slip-stock-column">Barcode / Stock No.</th>
                      <th className="acknowledgement-slip-date-column">Borrowed</th>
                      <th className="acknowledgement-slip-issued-by-column">Issued By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createItemRows(items).map((item, index) => (
                      <tr key={item ? `${item.transactionId}-${item.barcode}` : `empty-${pageNumber}-${index}`}>
                        <td>{item ? "1" : ""}</td>
                        <td>{item ? "pc" : ""}</td>
                        <td>{item?.toolName ?? ""}</td>
                        <td>{item?.category ?? ""}</td>
                        <td>{item?.barcode ?? ""}</td>
                        <td>{item ? formatShortDate(item.borrowedAt) : ""}</td>
                        <td>
                          {item ? (
                            <div className="acknowledgement-slip-issued-by-cell">
                              <div>{item.issuedByName ?? "Unknown"}</div>
                              {item.issuedByDetails ? <div>{item.issuedByDetails}</div> : null}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {isLastPage ? (
                  <section className="acknowledgement-slip-signatures">
                    <div>
                      <p className="acknowledgement-slip-signature-label">Acknowledged by:</p>
                      <div className="acknowledgement-slip-signature-line">{report.borrowerName}</div>
                      <p className="acknowledgement-slip-signature-caption">(Signature over Printed Name)</p>
                      <p className="acknowledgement-slip-designation">{formatBorrowerDesignation(report)}</p>
                      <div className="acknowledgement-slip-date-line">Date</div>
                    </div>

                    <div>
                      <p className="acknowledgement-slip-signature-label">Prepared by:</p>
                      <div className="acknowledgement-slip-signature-line">{preparedBy}</div>
                      <p className="acknowledgement-slip-signature-caption">(Signature over Printed Name)</p>
                      <p className="acknowledgement-slip-designation">Admin / Laboratory Staff</p>
                      <div className="acknowledgement-slip-date-line">Date</div>
                    </div>
                  </section>
                ) : (
                  <div className="acknowledgement-slip-continuation">
                    Continued on next page
                  </div>
                )}
              </article>
            </section>
          );
        });
      })}

      <style jsx global>{`
        .acknowledgement-print-output {
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

          body.${ACKNOWLEDGEMENT_REPORT_PRINTING_CLASS} > :not(.acknowledgement-print-output) {
            display: none !important;
          }

          body.${ACKNOWLEDGEMENT_REPORT_PRINTING_CLASS} .acknowledgement-print-output {
            display: block !important;
            position: static !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }

          .acknowledgement-print-page {
            align-items: center !important;
            box-sizing: border-box !important;
            display: flex !important;
            justify-content: center !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 12mm !important;
            page-break-after: always !important;
            break-after: page !important;
          }

          .acknowledgement-print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          .acknowledgement-slip-paper {
            box-sizing: border-box !important;
            width: 186mm !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            font-family: "Times New Roman", Times, serif !important;
            font-size: 9px !important;
            line-height: 1.18 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .acknowledgement-slip-title {
            border: 1px solid #000 !important;
            padding: 3mm 2mm 2.5mm !important;
            text-align: center !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            letter-spacing: 0.04em !important;
          }

          .acknowledgement-slip-paper table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }

          .acknowledgement-slip-paper th,
          .acknowledgement-slip-paper td {
            border: 1px solid #000 !important;
            color: black !important;
            vertical-align: middle !important;
          }

          .acknowledgement-slip-meta-table td {
            height: 6.5mm !important;
            padding: 1mm 1.5mm !important;
          }

          .acknowledgement-slip-meta-table span {
            display: inline-block !important;
            min-width: 34mm !important;
          }

          .acknowledgement-slip-items-table th {
            height: 8mm !important;
            padding: 1mm !important;
            text-align: center !important;
            font-weight: 400 !important;
          }

          .acknowledgement-slip-items-table td {
            height: 8.2mm !important;
            padding: 1mm 1.2mm !important;
          }

          .acknowledgement-slip-items-table td:nth-child(1),
          .acknowledgement-slip-items-table td:nth-child(2),
          .acknowledgement-slip-items-table td:nth-child(4),
          .acknowledgement-slip-items-table td:nth-child(5),
          .acknowledgement-slip-items-table td:nth-child(6),
          .acknowledgement-slip-items-table td:nth-child(7) {
            text-align: center !important;
          }

          .acknowledgement-slip-quantity-column {
            width: 14mm !important;
          }

          .acknowledgement-slip-unit-column {
            width: 13mm !important;
          }

          .acknowledgement-slip-category-column {
            width: 23mm !important;
          }

          .acknowledgement-slip-stock-column {
            width: 30mm !important;
          }

          .acknowledgement-slip-date-column {
            width: 21mm !important;
          }

          .acknowledgement-slip-issued-by-column {
            width: 30mm !important;
          }

          .acknowledgement-slip-issued-by-cell {
            line-height: 1.15 !important;
          }

          .acknowledgement-slip-issued-by-cell div + div {
            font-size: 7px !important;
          }

          .acknowledgement-slip-signatures {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            min-height: 38mm !important;
            border: 1px solid #000 !important;
            border-top: 0 !important;
          }

          .acknowledgement-slip-signatures > div {
            display: flex !important;
            min-height: 38mm !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-end !important;
            padding: 1.5mm 7mm 3mm !important;
          }

          .acknowledgement-slip-signatures > div + div {
            border-left: 1px solid #000 !important;
          }

          .acknowledgement-slip-signature-label {
            align-self: flex-start !important;
            margin: 0 auto auto 0 !important;
          }

          .acknowledgement-slip-signature-line {
            width: 100% !important;
            border-bottom: 1px solid #000 !important;
            padding-bottom: 1mm !important;
            text-align: center !important;
            font-weight: 700 !important;
          }

          .acknowledgement-slip-signature-caption,
          .acknowledgement-slip-designation,
          .acknowledgement-slip-date-line {
            margin: 1mm 0 0 !important;
            text-align: center !important;
          }

          .acknowledgement-slip-signature-caption {
            font-size: 8px !important;
            font-style: italic !important;
          }

          .acknowledgement-slip-designation {
            min-height: 7mm !important;
          }

          .acknowledgement-slip-date-line {
            width: 34mm !important;
            border-top: 1px solid #000 !important;
            padding-top: 1mm !important;
          }

          .acknowledgement-slip-continuation {
            border: 1px solid #000 !important;
            border-top: 0 !important;
            padding: 4mm 2mm !important;
            text-align: center !important;
            font-style: italic !important;
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}

function createItemRows(items: AcknowledgementReportItem[]) {
  const rowCount = Math.max(MIN_ITEM_ROWS, items.length);

  return Array.from({ length: rowCount }, (_, index) => items[index] ?? null);
}

function paginateItems(items: AcknowledgementReportItem[]) {
  if (items.length === 0) {
    return [[]];
  }

  return Array.from({ length: Math.ceil(items.length / ITEMS_PER_PAGE) }, (_, index) =>
    items.slice(index * ITEMS_PER_PAGE, (index + 1) * ITEMS_PER_PAGE),
  );
}

function formatBorrowerDesignation(report: AcknowledgementReportGroup) {
  const borrowerType = report.borrowerType
    ? report.borrowerType.charAt(0).toUpperCase() + report.borrowerType.slice(1)
    : "Borrower / End-User";
  const courseAndSection = formatCourseAndSection(report);

  return courseAndSection === "N/A" ? borrowerType : `${borrowerType} - ${courseAndSection}`;
}

function formatCourseAndSection(report: AcknowledgementReportGroup) {
  const details = [
    report.borrowerProgram,
    report.borrowerYearLevel ? `Year ${report.borrowerYearLevel}` : null,
    report.borrowerSection ? `Section ${report.borrowerSection}` : null,
  ].filter(Boolean);

  return details.length ? details.join(" / ") : "N/A";
}

function formatDateRange(from: Date, to: Date) {
  if (from.toDateString() === to.toDateString()) {
    return formatCustodianDate(from);
  }

  return `${formatCustodianDate(from)} - ${formatCustodianDate(to)}`;
}

function formatCustodianDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date) {
  return formatRecordedAt(date).replace(/, \d{1,2}:\d{2} [AP]M$/, "");
}
