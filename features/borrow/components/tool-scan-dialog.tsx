"use client";

import type { FormEvent, RefObject } from "react";
import { useRef } from "react";
import { PlusIcon, PrinterIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { OverlappingField } from "@/core/ui/overlapping-field";
import { Separator } from "@/components/ui/separator";
import { BorrowerSelector } from "@/features/borrow/components/borrower-selector";
import { InventoryCustodianSlipPrintView } from "@/features/borrow/components/inventory-custodian-slip-print-view";
import { BorrowSessionPreview } from "@/features/borrow/components/borrow-session-preview";
import { ReturnSessionPreview } from "@/features/borrow/components/return-session-preview";
import { printCustodianSlip } from "@/features/borrow/lib/custodian-slip-print";
import type { BatchBorrowSession, BatchReturnSession, ScanMode } from "@/features/borrow/types";
import type { BorrowerProfile } from "@/features/borrowers/types";

type ToolScanDialogProps = {
  mode: ScanMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBorrowerId: string;
  onBorrowerChange: (value: string) => void;
  borrowers: BorrowerProfile[];
  isBorrowersLoading: boolean;
  isSubmitting: boolean;
  keepBarcodeFocused: boolean;
  barcodeRef: RefObject<HTMLInputElement | null>;
  barcodeValue: string;
  onBarcodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  batchBorrowSession: BatchBorrowSession | null;
  batchReturnSession: BatchReturnSession | null;
  issuedBy?: string;
  issuedByDetails?: string | null;
  onDone: () => void;
};

const dialogMeta: Record<
  ScanMode,
  {
    title: string;
    description: string;
    barcodeLabel: string;
    barcodePlaceholder: string;
  }
> = {
  borrow: {
    title: "Borrow Tools",
    description:
      "Select a borrower, then scan tool barcodes. The receipt preview updates after each successful borrow.",
    barcodeLabel: "Tool Barcode",
    barcodePlaceholder: "Scan a barcode to borrow",
  },
  return: {
    title: "Return Tools",
    description:
      "Scan a tool barcode to review it first, then confirm the return. The receipt preview updates after each confirmed return.",
    barcodeLabel: "Tool Barcode",
    barcodePlaceholder: "Scan a barcode to return",
  },
};

export function ToolScanDialog({
  mode,
  open,
  onOpenChange,
  selectedBorrowerId,
  onBorrowerChange,
  borrowers,
  isBorrowersLoading,
  isSubmitting,
  keepBarcodeFocused,
  barcodeRef,
  barcodeValue,
  onBarcodeChange,
  onSubmit,
  batchBorrowSession,
  batchReturnSession,
  issuedBy,
  issuedByDetails,
  onDone,
}: ToolScanDialogProps) {
  const meta = dialogMeta[mode];
  const isBorrowMode = mode === "borrow";
  const needsBorrower = isBorrowMode && !selectedBorrowerId;
  const formRef = useRef<HTMLFormElement>(null);
  const selectedBorrower = borrowers.find((borrower) => borrower.id === selectedBorrowerId) ?? null;
  const canPrintCustodianSlip = isBorrowMode && Boolean(batchBorrowSession?.items.length);

  function handlePrintCustodianSlip() {
    if (!canPrintCustodianSlip) {
      toast.info("Scan at least one borrowed item before printing the custody slip.");
      return;
    }

    if (!printCustodianSlip()) {
      toast.error("The custody slip can only be printed in the browser.");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-[72rem] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{meta.title}</DialogTitle>
            <DialogDescription>{meta.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 lg:grid-cols-[minmax(22rem,24rem)_auto_minmax(0,1fr)]">
            <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
              {isBorrowMode ? (
                <BorrowerSelectionSection
                  selectedBorrowerId={selectedBorrowerId}
                  onBorrowerChange={onBorrowerChange}
                  borrowers={borrowers}
                  isBorrowersLoading={isBorrowersLoading}
                  isSubmitting={isSubmitting}
                  needsBorrower={needsBorrower}
                />
              ) : (
                <ReturnInfoBanner />
              )}

              <BarcodeInputSection
                barcodeRef={barcodeRef}
                barcodeValue={barcodeValue}
                onBarcodeChange={onBarcodeChange}
                barcodeLabel={meta.barcodeLabel}
                barcodePlaceholder={meta.barcodePlaceholder}
                isSubmitting={isSubmitting}
                disabled={needsBorrower}
                formRef={formRef}
                keepBarcodeFocused={keepBarcodeFocused}
              />
            </form>

            <Separator orientation="vertical" className="hidden lg:block" />

            <div className="min-w-0">
              {isBorrowMode ? (
                <BorrowSessionPreview session={batchBorrowSession} />
              ) : (
                <ReturnSessionPreview session={batchReturnSession} />
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {isBorrowMode ? (
              <Button
                type="button"
                variant="outline"
                disabled={!canPrintCustodianSlip}
                onClick={handlePrintCustodianSlip}
              >
                <PrinterIcon className="h-4 w-4" />
                Print Custody Slip
              </Button>
            ) : null}
            <Button type="button" onClick={onDone}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isBorrowMode && batchBorrowSession ? (
        <InventoryCustodianSlipPrintView
          borrower={selectedBorrower}
          issuedBy={issuedBy}
          issuedByDetails={issuedByDetails}
          session={batchBorrowSession}
        />
      ) : null}
    </>
  );
}

type BorrowerSelectionSectionProps = {
  selectedBorrowerId: string;
  onBorrowerChange: (value: string) => void;
  borrowers: BorrowerProfile[];
  isBorrowersLoading: boolean;
  isSubmitting: boolean;
  needsBorrower: boolean;
};

function BorrowerSelectionSection({
  selectedBorrowerId,
  onBorrowerChange,
  borrowers,
  isBorrowersLoading,
  isSubmitting,
  needsBorrower,
}: BorrowerSelectionSectionProps) {
  return (
    <div className="space-y-2">
      <OverlappingField htmlFor="borrower-id" label="Borrower">
        <BorrowerSelector
          borrowers={borrowers}
          selectedBorrowerId={selectedBorrowerId}
          onBorrowerChange={onBorrowerChange}
          disabled={isBorrowersLoading || isSubmitting}
          isLoading={isBorrowersLoading}
        />
      </OverlappingField>
      {needsBorrower ? (
        <p className="text-xs text-destructive" role="alert">
          Select a borrower before scanning tools.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Each successful scan updates the receipt preview without closing this dialog.
        </p>
      )}
    </div>
  );
}

function ReturnInfoBanner() {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/60 px-4 py-3 text-sm text-foreground">
      Return scanning does not require borrower selection. Each confirmed return updates the
      borrower&apos;s receipt preview with the remaining not-yet-returned items.
    </div>
  );
}

type BarcodeInputSectionProps = {
  barcodeRef: RefObject<HTMLInputElement | null>;
  barcodeValue: string;
  onBarcodeChange: (value: string) => void;
  barcodeLabel: string;
  barcodePlaceholder: string;
  isSubmitting: boolean;
  disabled: boolean;
  formRef: RefObject<HTMLFormElement | null>;
  keepBarcodeFocused: boolean;
};

function BarcodeInputSection({
  barcodeRef,
  barcodeValue,
  onBarcodeChange,
  barcodeLabel,
  barcodePlaceholder,
  isSubmitting,
  disabled,
  formRef,
  keepBarcodeFocused,
}: BarcodeInputSectionProps) {
  const shouldShowManualSubmit = barcodeValue.trim().length > 0;

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <OverlappingField htmlFor="barcode" label={barcodeLabel}>
          <Input
            id="barcode"
            ref={barcodeRef}
            type="text"
            value={barcodeValue}
            autoComplete="off"
            spellCheck={false}
            placeholder={barcodePlaceholder}
            disabled={isSubmitting || disabled}
            onChange={(event) => onBarcodeChange(event.target.value)}
            onBlur={() => {
              if (!keepBarcodeFocused || isSubmitting || disabled) {
                return;
              }

              window.setTimeout(() => {
                barcodeRef.current?.focus();
              }, 0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isSubmitting && !disabled) {
                event.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
        </OverlappingField>
        {shouldShowManualSubmit ? (
          <Button type="submit" className="h-11 sm:self-start" disabled={isSubmitting || disabled}>
            <PlusIcon className="h-4 w-4" />
            Add Item
          </Button>
        ) : null}
      </div>
      <span className="text-xs text-muted-foreground">
        Scan or type a barcode, then press Enter or Add Item.
      </span>
    </div>
  );
}
