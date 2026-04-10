"use client";

import { useCallback, useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import {
  listTransactions,
  previewReturnTransaction,
  processScanTransaction,
} from "@/features/borrow/lib/borrow-repository";
import type { ScanInput } from "@/features/borrow/lib/validations";

export function useTransactions() {
  const data = useLiveQuery(() => listTransactions(), []);

  return {
    data,
    isLoading: data === undefined,
  };
}

export function usePreviewReturn() {
  return useCallback(async (barcode: string) => previewReturnTransaction(barcode), []);
}

export function useProcessScan() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async ({ barcode, mode, borrowerId }: ScanInput) => {
    setIsPending(true);

    try {
      return await processScanTransaction(barcode, mode, borrowerId);
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    isPending,
    mutateAsync,
  };
}
