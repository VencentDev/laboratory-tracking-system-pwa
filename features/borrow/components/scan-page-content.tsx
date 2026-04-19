"use client";

import { exportTransactionsCsv } from "@/core/backup/export-data";
import { importTransactionsCsv } from "@/core/backup/import-data";
import { Button } from "@/core/ui/button";
import { CsvTransferActions } from "@/core/ui/csv-transfer-actions";
import { PageHeader } from "@/core/ui/page-header";
import { BorrowSummaryCards } from "@/features/borrow/components/borrow-summary-cards";
import { ReturnReviewDialog } from "@/features/borrow/components/return-review-dialog";
import { BorrowTransactionHistory } from "@/features/borrow/components/borrow-transaction-history";
import { ToolScanDialog } from "@/features/borrow/components/tool-scan-dialog";
import { useBorrowers } from "@/features/borrowers/hooks/use-borrower";
import { useScanScanner } from "@/features/borrow/hooks/use-scan-scanner";
import { useTransactions } from "@/features/borrow/hooks/use-borrow";

export function ScanPageContent() {
  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions();
  const { data: borrowers, isLoading: isBorrowersLoading } = useBorrowers();

  const {
    isOpen,
    mode,
    selectedBorrowerId,
    borrowOutstandingReceipt,
    returnOutstandingReceipt,
    pendingReturn,
    barcodeRef,
    isSubmitting,
    openScanner,
    closeScanner,
    handleBorrowerChange,
    handleSubmit,
    cancelPendingReturn,
    confirmPendingReturn,
  } = useScanScanner({
    autoClearOnSuccess: true,
    autoCloseOnSuccess: false,
  });

  const totalTransactions = transactions?.length ?? 0;
  const borrowedCount =
    transactions?.filter((t) => t.transactionType === "borrowed").length ?? 0;
  const returnedCount =
    transactions?.filter((t) => t.transactionType === "returned").length ?? 0;

  function handleOpenChange(open: boolean) {
    if (!open) {
      closeScanner();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scanning"
        title="Borrow & Return"
        description="Show each borrower's full currently borrowed list after each borrow scan, or confirm returns against the borrower's remaining outstanding items."
        actions={
          <div className="flex gap-2">
            <CsvTransferActions
              label="recent activity"
              exportLabel="Export recent activity CSV"
              importLabel="Import recent activity CSV"
              onExport={exportTransactionsCsv}
              onImport={importTransactionsCsv}
            />
            <Button type="button" className="px-5" onClick={() => openScanner("borrow")}>
              Borrow
            </Button>
            <Button
              type="button"
              variant="outline"
              className="px-5"
              onClick={() => openScanner("return")}
            >
              Return
            </Button>
          </div>
        }
      />

      <BorrowSummaryCards
        isLoading={isTransactionsLoading}
        totalTransactions={totalTransactions}
        borrowedCount={borrowedCount}
        returnedCount={returnedCount}
      />

      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
            Recent activity
          </h2>
          <p className="text-sm text-muted-foreground">
            Filter transaction history by date, borrower, or transaction type to confirm each checkout or return as it happens.
          </p>
        </div>
        <BorrowTransactionHistory isLoading={isTransactionsLoading} transactions={transactions ?? []} />
      </div>

      <ToolScanDialog
        mode={mode}
        open={isOpen}
        onOpenChange={handleOpenChange}
        selectedBorrowerId={selectedBorrowerId}
        onBorrowerChange={handleBorrowerChange}
        borrowers={borrowers ?? []}
        isBorrowersLoading={isBorrowersLoading}
        isSubmitting={isSubmitting}
        borrowOutstandingReceipt={borrowOutstandingReceipt}
        returnOutstandingReceipt={returnOutstandingReceipt}
        keepBarcodeFocused={mode === "return" && pendingReturn === null}
        barcodeRef={barcodeRef}
        onSubmit={handleSubmit}
      />

      <ReturnReviewDialog
        pendingReturn={pendingReturn}
        isSubmitting={isSubmitting}
        onCancel={cancelPendingReturn}
        onConfirm={confirmPendingReturn}
      />
    </div>
  );
}
