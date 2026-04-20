import { DatabaseBackupIcon, EraserIcon } from "lucide-react";

import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";

type SettingsLocalDataControlsPanelProps = {
  showSeedAction: boolean;
  isSeedPending: boolean;
  isClearPending: boolean;
  onLoadSeedData: () => void | Promise<void>;
  onRequestClearData: () => void;
};

export function SettingsLocalDataControlsPanel({
  showSeedAction,
  isSeedPending,
  isClearPending,
  onLoadSeedData,
  onRequestClearData,
}: SettingsLocalDataControlsPanelProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-3">
          {showSeedAction ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isSeedPending}
              onClick={() => void onLoadSeedData()}
            >
              <DatabaseBackupIcon className="h-4 w-4" />
              {isSeedPending ? "Loading sample data..." : "Load sample data"}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
            disabled={isClearPending}
            onClick={onRequestClearData}
          >
            <EraserIcon className="h-4 w-4" />
            {isClearPending ? "Clearing local data..." : "Clear local data"}
          </Button>
        </div>

        <div className="flex items-start gap-3 border-t border-border/70 pt-4 text-sm text-muted-foreground">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/70 text-[11px] font-medium text-foreground">
            !
          </span>
          <p>
            Clear local data only after exporting a backup. Preview deployments and different domains
            do not share this browser storage.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
