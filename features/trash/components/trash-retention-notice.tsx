"use client";

import { Clock3Icon } from "lucide-react";

import { TRASH_RETENTION_DAYS } from "@/features/trash/lib/trash-retention";

export function TrashRetentionNotice() {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Clock3Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Trash is automatically cleaned after {TRASH_RETENTION_DAYS} days.
          </p>
          <p className="text-sm text-muted-foreground">
            Restore anything you still need before the retention window ends, or permanently delete
            it now from the tables below.
          </p>
        </div>
      </div>
    </div>
  );
}
