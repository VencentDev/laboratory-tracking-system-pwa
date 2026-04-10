"use client";

import { trpc } from "@/core/lib/trpc-client";

export function useTools() {
  return trpc.tools.list.useQuery();
}

export function useToolByBarcode(barcode: string) {
  return trpc.tools.byBarcode.useQuery(
    { barcode },
    {
      enabled: barcode.trim().length > 0,
    },
  );
}
