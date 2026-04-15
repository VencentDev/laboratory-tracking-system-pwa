"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { DatabaseBackupIcon, DownloadIcon, EraserIcon, HardDriveDownloadIcon, SmartphoneIcon } from "lucide-react";
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
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { PageHeader } from "@/core/ui/page-header";

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings & Safety"
        description="Install the local app, export backups, restore records, and manage this device’s offline data safely."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SmartphoneIcon className="h-5 w-5" />
              Install & Offline Status
            </CardTitle>
            <CardDescription>
              Use the installed app on the final production domain so this browser origin keeps the real IndexedDB data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="font-medium text-foreground">Connection</p>
              <p>{isOnline ? "Online now. First-load and updates are available." : "Offline now. Cached screens and local data should still work."}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="font-medium text-foreground">Install status</p>
              <p>
                {isInstalled
                  ? "This app is already running in installed mode on this device."
                  : isInstallable
                    ? "This browser can install the app for easier offline access."
                    : "No install prompt is available right now. Open this on Chrome or Edge after a full page load."}
              </p>
            </div>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={!isInstallable || isWorking === "install"}
              onClick={() => void handleInstall()}
            >
              {isWorking === "install" ? "Opening install prompt..." : isInstalled ? "Installed" : "Install app"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseBackupIcon className="h-5 w-5" />
              Backup Health
            </CardTitle>
            <CardDescription>
              Local-first data needs routine exports before pilots, device changes, or browser resets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
              <p className="font-medium text-foreground">Last JSON backup</p>
              <p className="text-muted-foreground">{formatTimestamp(lastBackup?.value)}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
              <p className="font-medium text-foreground">Last restore</p>
              <p className="text-muted-foreground">{formatTimestamp(lastRestore?.value)}</p>
            </div>
            <p className="text-muted-foreground">
              Recommended routine: use the installed app, export JSON backups regularly, and restore from backup when moving devices.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export & Restore</CardTitle>
            <CardDescription>
              JSON preserves the whole local database. CSV exports are optional report-friendly extracts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              className="w-full justify-start gap-2"
              disabled={isWorking === "backup"}
              onClick={() => void handleExportBackup()}
            >
              <DownloadIcon className="h-4 w-4" />
              {isWorking === "backup" ? "Exporting JSON backup..." : "Export JSON backup"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => void exportBorrowersCsv()}
            >
              <DownloadIcon className="h-4 w-4" />
              Export borrowers CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => void exportTransactionsCsv()}
            >
              <DownloadIcon className="h-4 w-4" />
              Export transactions CSV
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => void handleImportChange(event)}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              disabled={isWorking === "import"}
              onClick={() => importInputRef.current?.click()}
            >
              <HardDriveDownloadIcon className="h-4 w-4" />
              {isWorking === "import" ? "Importing backup..." : "Import JSON backup"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local Data Controls</CardTitle>
            <CardDescription>
              These actions affect only this browser on this origin. Use them carefully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {process.env.NODE_ENV === "development" ? (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2"
                disabled={isWorking === "seed"}
                onClick={() => void handleLoadSeedData()}
              >
                <DatabaseBackupIcon className="h-4 w-4" />
                {isWorking === "seed" ? "Loading sample data..." : "Load sample data"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="destructive"
              className="w-full justify-start gap-2"
              disabled={isWorking === "clear"}
              onClick={() => setIsClearDataDialogOpen(true)}
            >
              <EraserIcon className="h-4 w-4" />
              {isWorking === "clear" ? "Clearing local data..." : "Clear local data"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Clear local data only after exporting a backup. Preview deployments and different domains do not share this browser storage.
            </p>
          </CardContent>
        </Card>
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
