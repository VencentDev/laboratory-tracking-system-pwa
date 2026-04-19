"use client";

import type { FormEvent, RefObject } from "react";
import { useRef } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { OverlappingField } from "@/core/ui/overlapping-field";
import { BorrowerSelector } from "@/features/borrow/components/borrower-selector";
import type { ScanMode } from "@/features/borrow/types";
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
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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
      "Select a borrower, then scan a tool barcode. Each successful borrow opens a dedicated receipt modal with the borrower's current borrowed-item table.",
    barcodeLabel: "Tool Barcode",
    barcodePlaceholder: "Scan a barcode to borrow",
  },
  return: {
    title: "Return Tools",
    description:
      "Scan a tool barcode to review it first, then confirm the return and open a receipt modal for the borrower's remaining outstanding items.",
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
  onSubmit,
}: ToolScanDialogProps) {
  const meta = dialogMeta[mode];
  const isBorrowMode = mode === "borrow";
  const needsBorrower = isBorrowMode && !selectedBorrowerId;
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>

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
            barcodeLabel={meta.barcodeLabel}
            barcodePlaceholder={meta.barcodePlaceholder}
            isSubmitting={isSubmitting}
            disabled={needsBorrower}
            formRef={formRef}
            keepBarcodeFocused={keepBarcodeFocused}
          />
        </form>
      </DialogContent>
    </Dialog>
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
          Each successful scan opens the borrower&apos;s receipt modal with the updated borrowed-item table.
        </p>
      )}
    </div>
  );
}

function ReturnInfoBanner() {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/60 px-4 py-3 text-sm text-foreground">
      Return scanning does not require borrower selection. Each confirmed return opens the
      borrower&apos;s receipt modal with the remaining not-yet-returned items.
    </div>
  );
}

type BarcodeInputSectionProps = {
  barcodeRef: RefObject<HTMLInputElement | null>;
  barcodeLabel: string;
  barcodePlaceholder: string;
  isSubmitting: boolean;
  disabled: boolean;
  formRef: RefObject<HTMLFormElement | null>;
  keepBarcodeFocused: boolean;
};

function BarcodeInputSection({
  barcodeRef,
  barcodeLabel,
  barcodePlaceholder,
  isSubmitting,
  disabled,
  formRef,
  keepBarcodeFocused,
}: BarcodeInputSectionProps) {
  return (
    <div className="space-y-2">
      <OverlappingField htmlFor="barcode" label={barcodeLabel}>
        <Input
          id="barcode"
          ref={barcodeRef}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={barcodePlaceholder}
          disabled={isSubmitting || disabled}
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
      <span className="text-xs text-muted-foreground">
        {keepBarcodeFocused
          ? "The return scanner stays active while this dialog is open."
          : "Each scan submits when the scanner sends Enter."}
      </span>
    </div>
  );
}
