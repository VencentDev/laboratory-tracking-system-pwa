import type { ChangeEvent, RefObject } from "react";

import { DatabaseBackupIcon, DownloadIcon, HardDriveDownloadIcon } from "lucide-react";

import { SettingsActionTile } from "@/features/borrowers/components/settings-action-tile";

type SettingsExportRestorePanelProps = {
  importInputRef: RefObject<HTMLInputElement | null>;
  isBackupPending: boolean;
  isImportPending: boolean;
  onExportBackup: () => void | Promise<void>;
  onExportBorrowersCsv: () => void | Promise<void>;
  onExportTransactionsCsv: () => void | Promise<void>;
  onImportChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onImportTrigger: () => void;
};

export function SettingsExportRestorePanel({
  importInputRef,
  isBackupPending,
  isImportPending,
  onExportBackup,
  onExportBorrowersCsv,
  onExportTransactionsCsv,
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
          onClick={() => void onExportBackup()}
        />
        <SettingsActionTile
          icon={<DownloadIcon className="h-4 w-4" />}
          title="Export borrowers CSV"
          description="Report-friendly"
          onClick={() => void onExportBorrowersCsv()}
        />
        <SettingsActionTile
          icon={<DownloadIcon className="h-4 w-4" />}
          title="Export transactions CSV"
          description="Report-friendly"
          onClick={() => void onExportTransactionsCsv()}
        />
        <SettingsActionTile
          icon={<HardDriveDownloadIcon className="h-4 w-4" />}
          title={isImportPending ? "Importing backup..." : "Import JSON backup"}
          description="Restore from file"
          disabled={isImportPending}
          onClick={onImportTrigger}
        />
      </div>
    </>
  );
}
