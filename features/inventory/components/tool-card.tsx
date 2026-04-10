import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import type { ToolProfile, ToolStatus } from "@/features/inventory/types";

type ToolCardProps = {
  tool: ToolProfile;
  actions?: ReactNode;
};

export function formatToolStatus(status: ToolStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getToolStatusClasses(status: ToolStatus) {
  switch (status) {
    case "available":
      return "border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "borrowed":
      return "border-border/80 bg-muted text-foreground/80";
    case "missing":
      return "border-destructive/15 bg-destructive/10 text-destructive";
    default:
      return "border-border/80 bg-muted text-muted-foreground";
  }
}

export function ToolCard({ tool, actions }: ToolCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <CardTitle className="text-xl">{tool.name || "Unnamed tool"}</CardTitle>
          <p className="font-mono text-sm text-muted-foreground">{tool.barcode}</p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getToolStatusClasses(tool.currentStatus)}`}
        >
          {formatToolStatus(tool.currentStatus)}
        </span>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="space-y-1">
          <p>Category: {tool.category || "Uncategorized"}</p>
          <p>Description: {tool.description || "No description provided."}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}
