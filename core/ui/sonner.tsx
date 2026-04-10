"use client";

import { Toaster } from "sonner";

import { useTheme } from "@/core/providers/theme-provider";

export function SonnerToaster() {
  const { resolvedTheme } = useTheme();

  return <Toaster closeButton position="bottom-right" richColors={false} theme={resolvedTheme} />;
}
