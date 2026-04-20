"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { DatabaseBackupIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";

import { buildDevSeedBackup } from "@/core/backup/dev-seed";
import {
  exportBorrowersCsv,
  exportJsonBackup,
  exportToolsCsv,
  exportTransactionsCsv,
} from "@/core/backup/export-data";
import { clearAllLocalData, parseBackupFile, restoreBackup } from "@/core/backup/import-data";
import { DestructiveConfirmDialog } from "@/core/components/destructive-confirm-dialog";
import { getAppSetting } from "@/core/db/app-settings";
import { useInstallPrompt } from "@/core/pwa/use-install-prompt";
import { PageHeader } from "@/core/ui/page-header";
import { SettingsActionConfirmDialog } from "@/features/borrowers/components/settings-action-confirm-dialog";
import { SettingsBackupHealthPanel } from "@/features/borrowers/components/settings-backup-health-panel";
import { SettingsExportRestorePanel } from "@/features/borrowers/components/settings-export-restore-panel";
import { SettingsInstallStatusPanel } from "@/features/borrowers/components/settings-install-status-panel";
import { SettingsLocalDataControlsPanel } from "@/features/borrowers/components/settings-local-data-controls-panel";
import { SettingsSection } from "@/features/borrowers/components/settings-section";
import { formatSettingsTimestamp } from "@/features/borrowers/lib/settings-format";

type SettingsConfirmAction = "backup" | "itemsCsv" | "borrowersCsv" | "transactionsCsv" | "seed" | null;

export function SettingsPageContent() {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isWorking, setIsWorking] = useState<
    null | "backup" | "itemsCsv" | "borrowersCsv" | "transactionsCsv" | "import" | "clear" | "seed" | "install"
  >(null);
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<SettingsConfirmAction>(null);
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

  async function handleExportItemsCsv() {
    setIsWorking("itemsCsv");

    try {
      await exportToolsCsv();
      toast.success("Items CSV exported.");
    } catch {
      toast.error("Items CSV export failed. Try again in this browser.");
    } finally {
      setIsWorking(null);
    }
  }

  async function handleExportBorrowersCsv() {
    setIsWorking("borrowersCsv");

    try {
      await exportBorrowersCsv();
      toast.success("Borrowers CSV exported.");
    } catch {
      toast.error("Borrowers CSV export failed. Try again in this browser.");
    } finally {
      setIsWorking(null);
    }
  }

  async function handleExportTransactionsCsv() {
    setIsWorking("transactionsCsv");

    try {
      await exportTransactionsCsv();
      toast.success("Transactions CSV exported.");
    } catch {
      toast.error("Transactions CSV export failed. Try again in this browser.");
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

  async function handleConfirmAction() {
    const action = confirmAction;

    if (!action) {
      return;
    }

    try {
      if (action === "backup") {
        await handleExportBackup();
        return;
      }

      if (action === "itemsCsv") {
        await handleExportItemsCsv();
        return;
      }

      if (action === "borrowersCsv") {
        await handleExportBorrowersCsv();
        return;
      }

      if (action === "transactionsCsv") {
        await handleExportTransactionsCsv();
        return;
      }

      await handleLoadSeedData();
    } finally {
      setConfirmAction(null);
    }
  }

  const confirmDialogContent =
    confirmAction === "backup"
      ? {
          title: "Export JSON backup?",
          description: "This downloads a full JSON snapshot of the local database stored in this browser.",
          confirmLabel: "Export backup",
          pendingLabel: "Exporting...",
          icon: <DownloadIcon className="size-6" />,
        }
      : confirmAction === "itemsCsv"
        ? {
            title: "Export items CSV?",
            description: "This downloads a report-friendly CSV of the current inventory items on this device.",
            confirmLabel: "Export items CSV",
            pendingLabel: "Exporting...",
            icon: <DownloadIcon className="size-6" />,
          }
        : confirmAction === "borrowersCsv"
          ? {
              title: "Export borrowers CSV?",
              description: "This downloads a report-friendly CSV of registered borrowers from this browser.",
              confirmLabel: "Export borrowers CSV",
              pendingLabel: "Exporting...",
              icon: <DownloadIcon className="size-6" />,
            }
          : confirmAction === "transactionsCsv"
            ? {
                title: "Export transactions CSV?",
                description: "This downloads a report-friendly CSV of the recorded transaction history on this device.",
                confirmLabel: "Export transactions CSV",
                pendingLabel: "Exporting...",
                icon: <DownloadIcon className="size-6" />,
              }
            : confirmAction === "seed"
              ? {
                  title: "Load sample data?",
                  description:
                    "This replaces the current local data with sample records for testing. Export a backup first if you need the current data.",
                  confirmLabel: "Load sample data",
                  pendingLabel: "Loading...",
                  icon: <DatabaseBackupIcon className="size-6" />,
                }
              : null;

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
            isItemsExportPending={isWorking === "itemsCsv"}
            isBorrowersExportPending={isWorking === "borrowersCsv"}
            isTransactionsExportPending={isWorking === "transactionsCsv"}
            isImportPending={isWorking === "import"}
            onRequestExportBackup={() => setConfirmAction("backup")}
            onRequestExportItemsCsv={() => setConfirmAction("itemsCsv")}
            onRequestExportBorrowersCsv={() => setConfirmAction("borrowersCsv")}
            onRequestExportTransactionsCsv={() => setConfirmAction("transactionsCsv")}
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
            onLoadSeedData={() => setConfirmAction("seed")}
            onRequestClearData={() => setIsClearDataDialogOpen(true)}
          />
        </SettingsSection>
      </div>

      {confirmDialogContent ? (
        <SettingsActionConfirmDialog
          open={confirmAction !== null}
          onOpenChange={(open) => {
            if (!open) {
              setConfirmAction(null);
            }
          }}
          title={confirmDialogContent.title}
          description={confirmDialogContent.description}
          confirmLabel={confirmDialogContent.confirmLabel}
          pendingLabel={confirmDialogContent.pendingLabel}
          isPending={confirmAction === isWorking}
          icon={confirmDialogContent.icon}
          onConfirm={handleConfirmAction}
        />
      ) : null}

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
