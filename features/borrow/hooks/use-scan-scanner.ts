"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { usePreviewReturn, useProcessScan } from "@/features/borrow/hooks/use-borrow";
import type { ReturnPreview, ScanFeedback, ScanMode, ScanResult } from "@/features/borrow/types";

type UseScanScannerOptions = {
  /** Auto-clear the barcode input after a successful scan (default: true) */
  autoClearOnSuccess?: boolean;
  /** Auto-close the dialog after a successful scan (default: false for continuous scanning) */
  autoCloseOnSuccess?: boolean;
};

export function useScanScanner(options: UseScanScannerOptions = {}) {
  const { autoClearOnSuccess = true, autoCloseOnSuccess = false } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ScanMode>("borrow");
  const [selectedBorrowerId, setSelectedBorrowerId] = useState("");
  const [scanResult, setScanResult] = useState<ScanFeedback | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [pendingReturn, setPendingReturn] = useState<ReturnPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const processScan = useProcessScan();
  const previewReturn = usePreviewReturn();

  // Auto-focus barcode input when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const focusTimeout = setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);

    return () => clearTimeout(focusTimeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || mode !== "return" || pendingReturn || isPreviewLoading) {
      return;
    }

    const focusTimeout = window.setTimeout(() => {
      barcodeRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimeout);
  }, [isOpen, mode, pendingReturn, isPreviewLoading]);

  // Auto-clear scan result feedback after delay
  useEffect(() => {
    if (!scanResult) return;

    const timeoutId = window.setTimeout(() => {
      setScanResult(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [scanResult]);

  const openScanner = useCallback((scannerMode: ScanMode) => {
    setMode(scannerMode);
    setScanResult(null);
    setLastScannedBarcode(null);
    setPendingReturn(null);
    setIsPreviewLoading(false);

    // Reset borrower selection when switching to return mode
    if (scannerMode === "return") {
      setSelectedBorrowerId("");
    }

    setIsOpen(true);
  }, []);

  const closeScanner = useCallback(() => {
    setIsOpen(false);
    setScanResult(null);
    setLastScannedBarcode(null);
    setPendingReturn(null);
    setIsPreviewLoading(false);
  }, []);

  const clearBarcodeInput = useCallback(() => {
    if (barcodeRef.current) {
      barcodeRef.current.value = "";
      barcodeRef.current.focus();
    }
  }, []);

  const handleScanSuccess = useCallback(
    (result: ScanResult, currentMode: ScanMode) => {
      const successMessage =
        currentMode === "borrow"
          ? `✓ ${result.toolName} checked out to ${result.borrowerName}`
          : `✓ ${result.toolName} returned successfully`;

      toast.success(successMessage, {
        description:
          currentMode === "borrow"
            ? `Barcode: ${result.barcode}`
            : `Previously with ${result.borrowerName}`,
        duration: 5000,
      });

      setLastScannedBarcode(result.barcode);

      if (autoClearOnSuccess) {
        clearBarcodeInput();
      }

      if (autoCloseOnSuccess && currentMode === "borrow") {
        closeScanner();
      }
    },
    [autoClearOnSuccess, autoCloseOnSuccess, clearBarcodeInput, closeScanner],
  );

  const handleScanError = useCallback((errorCode: string) => {
    const errorConfig = getScanErrorConfig(errorCode);

    toast.error(errorConfig.title, {
      description: errorConfig.description,
      duration: 6000,
    });

    // Clear the barcode on error so user can try again
    clearBarcodeInput();
  }, [clearBarcodeInput]);

  const handleReturnPreview = useCallback(
    async (barcode: string) => {
      setIsPreviewLoading(true);

      try {
        const result = await previewReturn(barcode);

        if ("code" in result) {
          handleScanError(result.code);
          return;
        }

        setPendingReturn(result);
        clearBarcodeInput();
      } catch {
        toast.error("Preview failed", {
          description: "Could not load the item details from local storage. Try again.",
          duration: 6000,
        });

        setScanResult({
          type: "error",
          message: "Could not load the item details from local storage. Try again.",
        });
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [previewReturn, handleScanError, clearBarcodeInput],
  );

  const cancelPendingReturn = useCallback(() => {
    setPendingReturn(null);
    setScanResult(null);
    clearBarcodeInput();
  }, [clearBarcodeInput]);

  const confirmPendingReturn = useCallback(async () => {
    if (!pendingReturn || processScan.isPending) {
      return;
    }

    try {
      const result = await processScan.mutateAsync({
        barcode: pendingReturn.barcode,
        mode: "return",
      });

      if ("code" in result) {
        setPendingReturn(null);
        handleScanError(result.code);
        return;
      }

      setPendingReturn(null);
      handleScanSuccess(result, "return");
    } catch {
      toast.error("Return failed", {
        description: "Could not write the return transaction to local storage. Try again.",
        duration: 6000,
      });

      setScanResult({
        type: "error",
        message: "Could not record the transaction in local storage. Try again.",
      });
    }
  }, [pendingReturn, processScan, handleScanError, handleScanSuccess]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedBarcode = barcodeRef.current?.value.trim() ?? "";

      // Guard: empty barcode
      if (!trimmedBarcode) {
        barcodeRef.current?.focus();
        toast.info("Please scan or enter a barcode", {
          description: "The barcode field cannot be empty.",
          duration: 3000,
        });
        return;
      }

      // Guard: prevent duplicate scan of the same barcode
      if (trimmedBarcode === lastScannedBarcode) {
        toast.warning("Already scanned", {
          description: "This barcode was just processed. Scan a different item or clear to retry.",
          duration: 4000,
        });
        setScanResult({
          type: "error",
          message: "This barcode was already processed. Enter a different barcode.",
        });
        clearBarcodeInput();
        return;
      }

      // Guard: borrow mode requires borrower selection
      if (mode === "borrow" && !selectedBorrowerId) {
        toast.warning("Borrower required", {
          description: "Please select a borrower before scanning tools to borrow.",
          duration: 4000,
        });
        setScanResult({
          type: "error",
          message: "Select a borrower before borrowing tools.",
        });
        return;
      }

      // Guard: prevent submission while processing
      if (processScan.isPending || isPreviewLoading || pendingReturn) {
        return;
      }

      if (mode === "return") {
        await handleReturnPreview(trimmedBarcode);
        return;
      }

      try {
        const result = await processScan.mutateAsync({
          barcode: trimmedBarcode,
          mode,
          borrowerId: mode === "borrow" ? selectedBorrowerId || undefined : undefined,
        });

        // Check if result is an error response (has 'code' property)
        if ("code" in result) {
          handleScanError(result.code);
          return;
        }

        // Success response (has 'action' property)
        handleScanSuccess(result, mode);
      } catch {
        toast.error("Borrow failed", {
          description: "Could not record the transaction in local storage. Try again.",
          duration: 6000,
        });

        setScanResult({
          type: "error",
          message: "Could not record the transaction in local storage. Try again.",
        });
      }
    },
    [
      lastScannedBarcode,
      mode,
      selectedBorrowerId,
      processScan,
      isPreviewLoading,
      pendingReturn,
      handleReturnPreview,
      handleScanError,
      handleScanSuccess,
      clearBarcodeInput,
    ],
  );

  return {
    // State
    isOpen,
    mode,
    selectedBorrowerId,
    scanResult,
    pendingReturn,
    barcodeRef,
    isSubmitting: processScan.isPending || isPreviewLoading,

    // Actions
    openScanner,
    closeScanner,
    setSelectedBorrowerId,
    handleSubmit,
    cancelPendingReturn,
    confirmPendingReturn,
  };
}

type ScanErrorConfig = {
  title: string;
  message: string;
  description: string;
};

function getScanErrorConfig(errorCode: string): ScanErrorConfig {
  switch (errorCode) {
    case "NOT_FOUND":
      return {
        title: "Tool not found",
        message: "No tool found with this barcode",
        description: "Verify the barcode exists in the inventory before scanning.",
      };
    case "NO_BORROWER":
      return {
        title: "Borrower required",
        message: "Please select a borrower before scanning",
        description: "A borrower must be selected to check out a tool.",
      };
    case "NOT_AVAILABLE_FOR_BORROW":
      return {
        title: "Item not available",
        message: "This tool is already borrowed and cannot be checked out",
        description: "The item needs to be returned before it can be borrowed again.",
      };
    case "NOT_AVAILABLE_FOR_RETURN":
      return {
        title: "Already available",
        message: "This tool is already in inventory and cannot be returned",
        description: "Only borrowed or missing items can be returned.",
      };
    case "DB_ERROR":
    default:
      return {
        title: "Transaction failed",
        message: "Could not complete this transaction. Try again in a moment.",
        description: "If this persists, contact support or check the database connection.",
      };
  }
}
