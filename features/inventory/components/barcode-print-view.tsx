"use client";

import { Button } from "@/core/ui/button";
import { BarcodeDisplay } from "@/features/inventory/components/barcode-display";
import type { ToolProfile } from "@/features/inventory/types";

type BarcodePrintViewProps = {
  tools: ToolProfile | ToolProfile[];
};

const ROWS_PER_PAGE = 7;
const COLUMNS_PER_PAGE = 3;
const LABELS_PER_PAGE = ROWS_PER_PAGE * COLUMNS_PER_PAGE;

export function BarcodePrintView({ tools }: BarcodePrintViewProps) {
  const labels = Array.isArray(tools) ? tools : [tools];
  const pages = Array.from({ length: Math.ceil(labels.length / LABELS_PER_PAGE) }, (_, pageIndex) =>
    labels.slice(
      pageIndex * LABELS_PER_PAGE,
      pageIndex * LABELS_PER_PAGE + LABELS_PER_PAGE,
    ),
  );

  return (
    <div className="batch-barcode-print-root space-y-6">
      <div className="batch-barcode-print-toolbar flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Barcode Labels</h2>
          <p className="text-sm text-muted-foreground">
            Print each barcode label on standard paper and cut or mount it for the registered tool.
          </p>
        </div>
        <Button type="button" disabled={labels.length === 0} onClick={() => window.print()}>
          Print All Labels
        </Button>
      </div>

      {labels.length === 0 ? (
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No barcode labels are available to print.
        </div>
      ) : (
        <div className="batch-barcode-print-pages space-y-6">
          {pages.map((pageLabels, pageIndex) => (
            <div
              key={`page-${pageIndex + 1}`}
              className="batch-barcode-print-page"
            >
              {pageLabels.map((tool) => (
                <div key={tool.id} className="barcode-label print:break-inside-avoid">
                  <BarcodeDisplay
                    borderless
                    itemName={tool.name}
                    showPrintButton={false}
                    value={tool.barcode}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @page {
          margin: 12mm;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          .batch-barcode-print-root,
          .batch-barcode-print-root * {
            visibility: visible;
          }

          .batch-barcode-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }

          .batch-barcode-print-toolbar {
            display: none !important;
          }

          .batch-barcode-print-pages {
            display: block;
          }

          .batch-barcode-print-page {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-content: start;
            align-items: start;
            gap: 12mm;
            min-height: calc(100vh - 24mm);
            page-break-after: always;
            break-after: page;
          }

          .batch-barcode-print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          .barcode-label {
            break-inside: avoid;
            width: auto;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
