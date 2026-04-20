"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

import { buildDevSeedBackup } from "@/core/backup/dev-seed";
import {
  exportBorrowersCsv,
  exportJsonBackup,
  exportTransactionsCsv,
} from "@/core/backup/export-data";
import { clearAllLocalData, parseBackupFile, restoreBackup } from "@/core/backup/import-data";
import { DestructiveConfirmDialog } from "@/core/components/destructive-confirm-dialog";
import { getAppSetting } from "@/core/db/app-settings";
import { useInstallPrompt } from "@/core/pwa/use-install-prompt";
import { PageHeader } from "@/core/ui/page-header";
import { SettingsBackupHealthPanel } from "@/features/borrowers/components/settings-backup-health-panel";
import { SettingsExportRestorePanel } from "@/features/borrowers/components/settings-export-restore-panel";
import { SettingsInstallStatusPanel } from "@/features/borrowers/components/settings-install-status-panel";
import { SettingsLocalDataControlsPanel } from "@/features/borrowers/components/settings-local-data-controls-panel";
import { SettingsSection } from "@/features/borrowers/components/settings-section";
import { formatSettingsTimestamp } from "@/features/borrowers/lib/settings-format";

export function SettingsPageContent() {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isWorking, setIsWorking] = useState<null | "backup" | "import" | "clear" | "seed" | "install">(null);
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const lastBackup = useLiveQuery(() => getAppSetting("lastBackupAt"), []);
  const lastRestore = useLiveQuery(() => getAppSetting("lastRestoreAt"), []);
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOnlineStatus = () => setIsOnline(window.navigator.onLine);

    handleOnlineStatus();
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  async function handleExportBackup() {
    setIsWorking("backup");

    try {
      await exportJsonBackup();
      toast.success("JSON backup exported.");
    } catch {
      toast.error("Backup export failed. Try again in this browser.");
    } finally {
      setIsWorking(null);
    }
  }

  async function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsWorking("import");

    try {
      const parsedBackup = await parseBackupFile(file);
      await restoreBackup(parsedBackup);
      toast.success("Backup restored successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Backup import failed. Check the file and try again.",
      );
    } finally {
      event.target.value = "";
      setIsWorking(null);
    }
  }

  async function handleLoadSeedData() {
    const confirmed = window.confirm(
      "Replace the current local data with sample records for testing? Export a backup first if you need the current data.",
    );

    if (!confirmed) {
      return;
    }

    setIsWorking("seed");

    try {
      await restoreBackup(buildDevSeedBackup());
      toast.success("Sample data loaded for local testing.");
    } catch {
      toast.error("Sample data could not be loaded.");
    } finally {
      setIsWorking(null);
    }
  }

  async function handleClearLocalData() {
    setIsWorking("clear");

    try {
      await clearAllLocalData();
      toast.success("All local data has been cleared.");
      setIsClearDataDialogOpen(false);
    } catch {
      toast.error("Local data could not be cleared.");
    } finally {
      setIsWorking(null);
    }
  }

  async function handleInstall() {
    setIsWorking("install");

    try {
      const installed = await promptInstall();

      if (installed) {
        toast.success("App install accepted.");
      } else {
        toast.message("Install prompt dismissed.");
      }
    } catch {
      toast.error("Install prompt could not be opened on this device.");
    } finally {
      setIsWorking(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader
        eyebrow="Workspace"
        title="Settings & Safety"
        description="Install the local app, export backups, restore records, and manage this device’s offline data safely."
      />

      <div className="space-y-12">
        <SettingsSection
          index="01"
          title="Install & Offline Status"
          description="Use the installed app on the final production domain so this browser origin keeps the real IndexedDB data."
        >
          <SettingsInstallStatusPanel
            isOnline={isOnline}
            isInstalled={isInstalled}
            isInstallable={isInstallable}
            isWorking={isWorking === "install"}
            onInstall={handleInstall}
          />
        </SettingsSection>

        <SettingsSection
          index="02"
          title="Backup Health"
          description="Local-first data needs routine exports before pilots, device changes, or browser resets."
        >
          <SettingsBackupHealthPanel
            lastBackupLabel={formatSettingsTimestamp(lastBackup?.value)}
            lastRestoreLabel={formatSettingsTimestamp(lastRestore?.value)}
          />
        </SettingsSection>

        <SettingsSection
          index="03"
          title="Export & Restore"
          description="JSON preserves the whole local database. CSV exports are optional report-friendly extracts."
        >
          <SettingsExportRestorePanel
            importInputRef={importInputRef}
            isBackupPending={isWorking === "backup"}
            isImportPending={isWorking === "import"}
            onExportBackup={handleExportBackup}
            onExportBorrowersCsv={exportBorrowersCsv}
            onExportTransactionsCsv={exportTransactionsCsv}
            onImportChange={handleImportChange}
            onImportTrigger={() => importInputRef.current?.click()}
          />
        </SettingsSection>

        <SettingsSection
          index="04"
          title="Local Data Controls"
          description="These actions affect only this browser on this origin. Use them carefully."
        >
          <SettingsLocalDataControlsPanel
            showSeedAction={process.env.NODE_ENV === "development"}
            isSeedPending={isWorking === "seed"}
            isClearPending={isWorking === "clear"}
            onLoadSeedData={handleLoadSeedData}
            onRequestClearData={() => setIsClearDataDialogOpen(true)}
          />
        </SettingsSection>
      </div>

      <DestructiveConfirmDialog
        open={isClearDataDialogOpen}
        onOpenChange={setIsClearDataDialogOpen}
        title="Clear all local data?"
        description="All local tools, borrowers, transactions, and settings on this device will be removed. This cannot be undone without a backup."
        confirmLabel="Clear local data"
        pendingLabel="Clearing..."
        isPending={isWorking === "clear"}
        onConfirm={handleClearLocalData}
      />
    </div>
  );
}
