import type { ChangeEvent, RefObject } from "react";

import { DatabaseBackupIcon, DownloadIcon, HardDriveDownloadIcon } from "lucide-react";

import { SettingsActionTile } from "@/features/borrowers/components/settings-action-tile";

type SettingsExportRestorePanelProps = {
  importInputRef: RefObject<HTMLInputElement | null>;
  isBackupPending: boolean;
  isItemsExportPending: boolean;
  isBorrowersExportPending: boolean;
  isTransactionsExportPending: boolean;
  isImportPending: boolean;
  onRequestExportBackup: () => void;
  onRequestExportItemsCsv: () => void;
  onRequestExportBorrowersCsv: () => void;
  onRequestExportTransactionsCsv: () => void;
  onImportChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onImportTrigger: () => void;
};

export function SettingsExportRestorePanel({
  importInputRef,
  isBackupPending,
  isItemsExportPending,
  isBorrowersExportPending,
  isTransactionsExportPending,
  isImportPending,
  onRequestExportBackup,
  onRequestExportItemsCsv,
  onRequestExportBorrowersCsv,
  onRequestExportTransactionsCsv,
  onImportChange,
  onImportTrigger,
}: SettingsExportRestorePanelProps) {
  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => void onImportChange(event)}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <SettingsActionTile
          icon={<DatabaseBackupIcon className="h-4 w-4" />}
          title={isBackupPending ? "Exporting JSON backup..." : "Export JSON backup"}
          description="Full database snapshot"
          variant="primary"
          disabled={isBackupPending}
          onClick={onRequestExportBackup}
        />
        <SettingsActionTile
          icon={<HardDriveDownloadIcon className="h-4 w-4" />}
          title={isImportPending ? "Importing backup..." : "Import JSON backup"}
          description="Restore from file"
          disabled={isImportPending}
          onClick={onImportTrigger}
        />
        <SettingsActionTile
          icon={<DownloadIcon className="h-4 w-4" />}
          title={isItemsExportPending ? "Exporting items CSV..." : "Export items CSV"}
          description="Inventory report"
          disabled={isItemsExportPending}
          onClick={onRequestExportItemsCsv}
        />
        <SettingsActionTile
          icon={<DownloadIcon className="h-4 w-4" />}
          title={isBorrowersExportPending ? "Exporting borrowers CSV..." : "Export borrowers CSV"}
          description="Report-friendly"
          disabled={isBorrowersExportPending}
          onClick={onRequestExportBorrowersCsv}
        />
        <SettingsActionTile
          icon={<DownloadIcon className="h-4 w-4" />}
          title={isTransactionsExportPending ? "Exporting transactions CSV..." : "Export transactions CSV"}
          description="Report-friendly"
          disabled={isTransactionsExportPending}
          onClick={onRequestExportTransactionsCsv}
        />
      </div>
    </>
  );
}
