"use client";

import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { formatToolStatus, getToolStatusClasses } from "@/features/inventory/components/tool-card";
import { restoreTool } from "@/features/inventory/lib/tool-repository";
import type { ToolProfile } from "@/features/inventory/types";
import { formatTrashTimestamp } from "@/features/trash/lib/trash-formatters";

type TrashToolsTableProps = {
  tools?: ToolProfile[];
  isLoading: boolean;
};

export function TrashToolsTable({ tools, isLoading }: TrashToolsTableProps) {

  async function handleRestore(toolId: number, toolName: string) {
    const restoredTool = await restoreTool(toolId);

    if (!restoredTool) {
      toast.error("The tool could not be restored from trash.");
      return;
    }

    toast.success(`${toolName} was restored to the inventory catalog.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trashed Tools</CardTitle>
        <CardDescription>Restore deleted tools back to the active inventory list whenever needed.</CardDescription>
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
            <DataTable className="min-w-[860px]">
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
                    <DataTableCell>{formatTrashTimestamp(tool.deletedAt)}</DataTableCell>
                    <DataTableCell className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => void handleRestore(tool.id, tool.name)}
                      >
                        <RotateCcwIcon className="h-4 w-4" />
                        Restore
                      </Button>
                    </DataTableCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </DataTableSurface>
        )}
      </CardContent>
    </Card>
  );
}
