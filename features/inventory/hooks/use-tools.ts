"use client";

import { useLiveQuery } from "dexie-react-hooks";

import { getToolByBarcode, listTools } from "@/features/inventory/lib/tool-repository";

export function useTools() {
  const data = useLiveQuery(() => listTools(), []);

  return {
    data,
    isLoading: data === undefined,
  };
}

export function useToolByBarcode(barcode: string) {
  const trimmedBarcode = barcode.trim();
  const data = useLiveQuery(
    async () => {
      if (!trimmedBarcode) {
        return null;
      }

      return getToolByBarcode(trimmedBarcode);
    },
    [trimmedBarcode],
  );

  return {
    data: trimmedBarcode ? data : null,
    isLoading: Boolean(trimmedBarcode) && data === undefined,
  };
}
