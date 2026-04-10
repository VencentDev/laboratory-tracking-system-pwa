"use client";

import { useCallback } from "react";

import { trpc } from "@/core/lib/trpc-client";

export function useTransactions() {
  return trpc.borrow.listTransactions.useQuery();
}

export function usePreviewReturn() {
  const utils = trpc.useUtils();

  return useCallback(
    async (barcode: string) => utils.borrow.previewReturn.fetch({ barcode }),
    [utils],
  );
}

export function useProcessScan() {
  const utils = trpc.useUtils();

  return trpc.borrow.processScan.useMutation({
    onSuccess: async () => {
      await utils.tools.list.invalidate();
      await utils.borrow.listTransactions.invalidate();
    },
  });
}
