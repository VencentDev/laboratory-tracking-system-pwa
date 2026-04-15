"use client";

import { useState } from "react";
import { RotateCcwIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { DestructiveConfirmDialog } from "@/core/components/destructive-confirm-dialog";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { formatToolStatus, getToolStatusClasses } from "@/features/inventory/components/tool-card";
import { permanentlyDeleteTool, restoreTool } from "@/features/inventory/lib/tool-repository";
import type { ToolProfile } from "@/features/inventory/types";
import { formatTrashAutoDeleteLabel, formatTrashTimestamp } from "@/features/trash/lib/trash-formatters";
import { TRASH_RETENTION_DAYS } from "@/features/trash/lib/trash-retention";

type TrashToolsTableProps = {
  tools?: ToolProfile[];
  isLoading: boolean;
};

export function TrashToolsTable({ tools, isLoading }: TrashToolsTableProps) {
  const [restoringToolId, setRestoringToolId] = useState<number | null>(null);
  const [toolPendingPermanentDelete, setToolPendingPermanentDelete] = useState<ToolProfile | null>(null);
  const [deletingToolId, setDeletingToolId] = useState<number | null>(null);

  async function handleRestore(toolId: number, toolName: string) {
    setRestoringToolId(toolId);

    try {
      const restoredTool = await restoreTool(toolId);

      if (!restoredTool) {
        toast.error("The tool could not be restored from trash.");
        return;
      }

      toast.success(`${toolName} was restored to the inventory catalog.`);
    } catch {
      toast.error("The tool could not be restored from trash.");
    } finally {
      setRestoringToolId(null);
    }
  }

  async function handlePermanentDelete() {
    if (!toolPendingPermanentDelete) {
      return;
    }

    setDeletingToolId(toolPendingPermanentDelete.id);

    try {
      const deletedTool = await permanentlyDeleteTool(toolPendingPermanentDelete.id);

      if (!deletedTool) {
        toast.error("The tool could not be permanently deleted from trash.");
        return;
      }

      toast.success(`${deletedTool.name} was permanently deleted.`);
      setToolPendingPermanentDelete(null);
    } catch {
      toast.error("The tool could not be permanently deleted from trash.");
    } finally {
      setDeletingToolId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trashed Tools</CardTitle>
        <CardDescription>
          Restore deleted tools back to the active inventory list or permanently remove them. Trash
          is cleared automatically after {TRASH_RETENTION_DAYS} days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading deleted tools...</p>
        ) : !tools?.length ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            No tools are in trash.
          </div>
        ) : (
          <DataTableSurface>
            <DataTable className="min-w-[960px]">
              <thead>
                <tr>
                  <DataTableHeaderCell>Tool</DataTableHeaderCell>
                  <DataTableHeaderCell>Barcode</DataTableHeaderCell>
                  <DataTableHeaderCell>Category</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                  <DataTableHeaderCell>Deleted</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-center">Action</DataTableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id}>
                    <DataTableCell className="font-medium text-foreground">{tool.name}</DataTableCell>
                    <DataTableCell>{tool.barcode}</DataTableCell>
                    <DataTableCell>{tool.category || "Uncategorized"}</DataTableCell>
                    <DataTableCell>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getToolStatusClasses(tool.currentStatus)}`}
                      >
                        {formatToolStatus(tool.currentStatus)}
                      </span>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="space-y-1">
                        <div>{formatTrashTimestamp(tool.deletedAt)}</div>
                        <div className="text-xs text-muted-foreground">{formatTrashAutoDeleteLabel(tool.deletedAt)}</div>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={restoringToolId === tool.id || deletingToolId === tool.id}
                          onClick={() => void handleRestore(tool.id, tool.name)}
                        >
                          <RotateCcwIcon className="h-4 w-4" />
                          {restoringToolId === tool.id ? "Restoring..." : "Restore"}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          disabled={restoringToolId === tool.id || deletingToolId === tool.id}
                          onClick={() => setToolPendingPermanentDelete(tool)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </DataTableCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </DataTableSurface>
        )}
      </CardContent>

      <DestructiveConfirmDialog
        open={Boolean(toolPendingPermanentDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setToolPendingPermanentDelete(null);
          }
        }}
        title="Delete this tool permanently?"
        description={
          toolPendingPermanentDelete
            ? `${toolPendingPermanentDelete.name} (${toolPendingPermanentDelete.barcode}) will be removed from Trash immediately. This cannot be undone.`
            : "This tool will be removed from Trash immediately. This cannot be undone."
        }
        confirmLabel="Delete permanently"
        isPending={deletingToolId === toolPendingPermanentDelete?.id}
        onConfirm={handlePermanentDelete}
      />
    </Card>
  );
}
