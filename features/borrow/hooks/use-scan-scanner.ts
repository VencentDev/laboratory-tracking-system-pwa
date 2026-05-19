"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  useOutstandingBorrowedItems,
  usePreviewReturn,
  useProcessScan,
} from "@/features/borrow/hooks/use-borrow";
import {
  printBorrowReceipt,
  printReturnReceipt,
} from "@/features/borrow/lib/receipt-print";
import type {
  BatchBorrowSession,
  BatchReturnSession,
  ReceiptItem,
  ReturnPreview,
  ScanFeedback,
  ScanMode,
  ScanResult,
} from "@/features/borrow/types";

type UseScanScannerOptions = {
  autoClearOnSuccess?: boolean;
};

export function useScanScanner(options: UseScanScannerOptions = {}) {
  const { autoClearOnSuccess = true } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ScanMode>("borrow");
  const [selectedBorrowerId, setSelectedBorrowerId] = useState("");
  const [scanResult, setScanResult] = useState<ScanFeedback | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [batchBorrowSession, setBatchBorrowSession] = useState<BatchBorrowSession | null>(null);
  const [batchReturnSession, setBatchReturnSession] = useState<BatchReturnSession | null>(null);
  const [receiptToPrint, setReceiptToPrint] = useState<BatchBorrowSession | BatchReturnSession | null>(null);
  const [pendingReturn, setPendingReturn] = useState<ReturnPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const processScan = useProcessScan();
  const previewReturn = usePreviewReturn();
  const loadOutstandingBorrowedItems = useOutstandingBorrowedItems();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimeout = window.setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(focusTimeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || mode !== "return" || pendingReturn || isPreviewLoading) {
      return;
    }

    const focusTimeout = window.setTimeout(() => {
      barcodeRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimeout);
  }, [isOpen, isPreviewLoading, mode, pendingReturn]);

  useEffect(() => {
    if (!scanResult) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setScanResult(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [scanResult]);

  const openScanner = useCallback((
    scannerMode: ScanMode,
    options?: {
      borrowerId?: string;
    },
  ) => {
    setMode(scannerMode);
    setScanResult(null);
    setLastScannedBarcode(null);
    setBatchBorrowSession(null);
    setBatchReturnSession(null);
    setReceiptToPrint(null);
    setPendingReturn(null);
    setIsPreviewLoading(false);

    if (scannerMode === "return") {
      setSelectedBorrowerId("");
    } else if (options?.borrowerId) {
      setSelectedBorrowerId(options.borrowerId);
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

  const handleBorrowerChange = useCallback(
    (value: string) => {
      if (selectedBorrowerId === value) {
        return;
      }

      setSelectedBorrowerId(value);

      if (mode === "borrow") {
        setLastScannedBarcode(null);
        setBatchBorrowSession(null);
        clearBarcodeInput();
      }
    },
    [clearBarcodeInput, mode, selectedBorrowerId],
  );

  const createReceiptItemFromPreview = useCallback((preview: ReturnPreview): ReceiptItem => {
    return {
      toolId: preview.toolId,
      toolName: preview.toolName,
      barcode: preview.barcode,
      category: preview.category,
      borrowedAt: preview.lastBorrowedAt,
    };
  }, []);

  const handleBorrowSuccess = useCallback(
    (result: ScanResult) => {
      const successMessage = `${result.toolName} checked out to ${result.borrowerName}`;
      const borrowerId = result.borrowerId;

      toast.success(successMessage, {
        description: `Barcode: ${result.barcode}`,
        duration: 5000,
      });

      setLastScannedBarcode(result.barcode);

      if (autoClearOnSuccess) {
        clearBarcodeInput();
      }

      if (!borrowerId) {
        return;
      }

      const item: ReceiptItem = {
        toolId: result.toolId,
        toolName: result.toolName,
        barcode: result.barcode,
        category: result.category,
        borrowedAt: result.recordedAt,
      };

      setBatchBorrowSession((currentSession) => {
        if (!currentSession || currentSession.borrowerId !== borrowerId) {
          return {
            borrowerId,
            borrowerName: result.borrowerName,
            borrowerSchoolId: result.borrowerSchoolId,
            items: [item],
          };
        }

        return {
          ...currentSession,
          borrowerName: result.borrowerName,
          borrowerSchoolId: result.borrowerSchoolId,
          items: [...currentSession.items, item],
        };
      });
    },
    [autoClearOnSuccess, clearBarcodeInput],
  );

  const handleReturnSuccess = useCallback(
    async (preview: ReturnPreview, result: ScanResult) => {
      const returnedItem = createReceiptItemFromPreview(preview);
      const borrower = {
        borrowerId: preview.borrowerId,
        borrowerSchoolId: preview.borrowerSchoolId,
        borrowerName: preview.borrowerName,
      };
      const outstandingItems = await loadOutstandingBorrowedItems(borrower);

      toast.success(`${result.toolName} returned successfully`, {
        description: `Previously with ${result.borrowerName}`,
        duration: 5000,
      });

      setLastScannedBarcode(result.barcode);

      if (autoClearOnSuccess) {
        clearBarcodeInput();
      }

      setBatchReturnSession((currentSession) => {
        const isSameReturnee =
          currentSession?.borrowerName === preview.borrowerName &&
          currentSession.borrowerSchoolId === preview.borrowerSchoolId;
        const currentUnreturnedItems = isSameReturnee
          ? currentSession.unreturnedItems
          : outstandingItems;
        const currentReturnedItems = isSameReturnee ? currentSession.returnedItems : [];
        const unreturnedItems = currentUnreturnedItems.filter(
          (item) => item.toolId !== returnedItem.toolId,
        );

        return {
          borrowerName: preview.borrowerName,
          borrowerSchoolId: preview.borrowerSchoolId,
          returnedItems: [...currentReturnedItems, returnedItem],
          unreturnedItems,
        };
      });
    },
    [autoClearOnSuccess, clearBarcodeInput, createReceiptItemFromPreview, loadOutstandingBorrowedItems],
  );

  const handleScanError = useCallback(
    (errorCode: string) => {
      const errorConfig = getScanErrorConfig(errorCode);

      toast.error(errorConfig.title, {
        description: errorConfig.description,
        duration: 6000,
      });

      clearBarcodeInput();
    },
    [clearBarcodeInput],
  );

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
    [clearBarcodeInput, handleScanError, previewReturn],
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
      const returnPreview = pendingReturn;
      const result = await processScan.mutateAsync({
        barcode: returnPreview.barcode,
        mode: "return",
      });

      if ("code" in result) {
        setPendingReturn(null);
        handleScanError(result.code);
        return;
      }

      setPendingReturn(null);
      await handleReturnSuccess(returnPreview, result);
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
  }, [
    handleReturnSuccess,
    handleScanError,
    pendingReturn,
    processScan,
  ]);

  const handleDone = useCallback(async () => {
    let printResult: Awaited<ReturnType<typeof printBorrowReceipt>> | null = null;

    if (mode === "borrow" && batchBorrowSession) {
      setReceiptToPrint(batchBorrowSession);
      toast.loading("Printing receipt...", { id: "receipt-print" });
      printResult = await printBorrowReceipt(batchBorrowSession);
    }

    if (mode === "return" && batchReturnSession) {
      setReceiptToPrint(batchReturnSession);
      toast.loading("Printing receipt...", { id: "receipt-print" });
      printResult = await printReturnReceipt(batchReturnSession);
    }

    if (printResult?.method === "bridge") {
      toast.success("Receipt printed", {
        id: "receipt-print",
        description: "The local print bridge accepted the receipt.",
        duration: 4000,
      });
    } else if (printResult?.method === "browser") {
      toast.warning("Direct printer unavailable", {
        id: "receipt-print",
        description: printResult.fallbackReason
          ? `${printResult.fallbackReason}. Opening browser print instead.`
          : "Opening browser print instead.",
        duration: 6000,
      });
    }

    closeScanner();
  }, [batchBorrowSession, batchReturnSession, closeScanner, mode]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedBarcode = barcodeRef.current?.value.trim() ?? "";

      if (!trimmedBarcode) {
        barcodeRef.current?.focus();
        toast.info("Please scan or enter a barcode", {
          description: "The barcode field cannot be empty.",
          duration: 3000,
        });
        return;
      }

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

        if ("code" in result) {
          handleScanError(result.code);
          return;
        }

        await handleBorrowSuccess(result);
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
      clearBarcodeInput,
      handleBorrowSuccess,
      handleReturnPreview,
      handleScanError,
      isPreviewLoading,
      lastScannedBarcode,
      mode,
      pendingReturn,
      processScan,
      selectedBorrowerId,
    ],
  );

  return {
    isOpen,
    mode,
    selectedBorrowerId,
    scanResult,
    batchBorrowSession,
    batchReturnSession,
    receiptToPrint,
    pendingReturn,
    barcodeRef,
    isSubmitting: processScan.isPending || isPreviewLoading,
    openScanner,
    closeScanner,
    handleDone,
    handleBorrowerChange,
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
