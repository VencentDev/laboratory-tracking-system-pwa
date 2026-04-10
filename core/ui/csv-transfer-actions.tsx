"use client";

import { useRef, useState } from "react";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import type { CsvImportSummary } from "@/core/lib/csv";
import { buttonVariants } from "@/core/ui/button";
import { cn } from "@/core/lib/utils";

type CsvTransferActionsProps = {
  label: string;
  exportLabel?: string;
  importLabel?: string;
  onExport: () => Promise<void>;
  onImport: (file: File) => Promise<CsvImportSummary>;
};

function formatSummary(summary: CsvImportSummary) {
  const parts = [`${summary.created} created`, `${summary.updated} updated`];

  if (summary.skipped > 0) {
    parts.push(`${summary.skipped} skipped`);
  }

  return parts.join(", ");
}

export function CsvTransferActions({
  label,
  exportLabel = `Export ${label} CSV`,
  importLabel = `Import ${label} CSV`,
  onExport,
  onImport,
}: CsvTransferActionsProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      await onExport();
      toast.success(exportLabel);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not export ${label.toLowerCase()} CSV.`);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(file: File) {
    setIsImporting(true);

    try {
      const summary = await onImport(file);
      toast.success(importLabel, {
        description: formatSummary(summary),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not import ${label.toLowerCase()} CSV.`);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          event.target.value = "";

          if (file) {
            void handleImport(file);
          }
        }}
      />
      <div className="inline-flex h-10 items-stretch overflow-hidden rounded-xl border border-border/80 bg-background/80 shadow-sm">
        <button
          type="button"
          aria-label={isExporting ? `${exportLabel}...` : exportLabel}
          title={isExporting ? `${exportLabel}...` : exportLabel}
          disabled={isExporting || isImporting}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-full w-10 rounded-none border-0 bg-transparent text-foreground hover:bg-muted/80",
          )}
          onClick={() => void handleExport()}
        >
          <DownloadIcon className="h-4 w-4" />
        </button>

        <div className="my-2 w-px bg-border/80" aria-hidden="true" />

        <button
          type="button"
          aria-label={isImporting ? `${importLabel}...` : importLabel}
          title={isImporting ? `${importLabel}...` : importLabel}
          disabled={isExporting || isImporting}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-full w-10 rounded-none border-0 bg-transparent text-foreground hover:bg-muted/80",
          )}
          onClick={() => importInputRef.current?.click()}
        >
          <UploadIcon className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
