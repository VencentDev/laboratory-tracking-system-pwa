import { Card, CardContent } from "@/core/ui/card";

type SettingsBackupHealthPanelProps = {
  lastBackupLabel: string;
  lastRestoreLabel: string;
};

type BackupHealthRowProps = {
  label: string;
  value: string;
};

function BackupHealthRow({ label, value }: BackupHealthRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function SettingsBackupHealthPanel({
  lastBackupLabel,
  lastRestoreLabel,
}: SettingsBackupHealthPanelProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <div className="divide-y divide-border/70">
          <BackupHealthRow label="Last JSON backup" value={lastBackupLabel} />
          <BackupHealthRow label="Last restore" value={lastRestoreLabel} />
        </div>

        <div className="border-t border-border/70 px-4 py-4 sm:px-5">
          <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Recommended routine: use the installed app, export JSON backups regularly, and restore from
            backup when moving devices.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
