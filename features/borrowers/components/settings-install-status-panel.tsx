import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { cn } from "@/core/lib/utils";

type SettingsInstallStatusPanelProps = {
  isOnline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  isWorking: boolean;
  onInstall: () => void | Promise<void>;
};

export function SettingsInstallStatusPanel({
  isOnline,
  isInstalled,
  isInstallable,
  isWorking,
  onInstall,
}: SettingsInstallStatusPanelProps) {
  const installStatusCopy = isInstalled
    ? "This app is already running in installed mode on this device."
    : isInstallable
      ? "This browser can install the app for easier offline access."
      : "No install prompt is available right now. Open this on Chrome or Edge after a full page load.";

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/90">
              Connection
            </p>
            <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  isOnline ? "bg-foreground" : "bg-muted-foreground",
                )}
              />
              <div className="space-y-1">
                <p className="font-medium text-foreground">{isOnline ? "Online now" : "Offline now"}</p>
                <p>
                  {isOnline
                    ? "First-load and updates are available."
                    : "Cached screens and local data should still work."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/90">
              Install status
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {isInstalled
                  ? "Installed"
                  : isInstallable
                    ? "Ready to install"
                    : "No install prompt available"}
              </p>
              <p>{installStatusCopy}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border/70 pt-4">
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!isInstallable || isWorking}
            onClick={() => void onInstall()}
          >
            {isWorking ? "Opening install prompt..." : isInstalled ? "Installed" : "Install app"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
