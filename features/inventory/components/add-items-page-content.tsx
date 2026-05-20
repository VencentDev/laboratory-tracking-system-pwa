"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { PlusIcon } from "lucide-react";

import { exportToolsCsv } from "@/core/backup/export-data";
import { importToolsCsv } from "@/core/backup/import-data";
import { Button } from "@/core/ui/button";
import { CsvTransferActions } from "@/core/ui/csv-transfer-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/ui/dialog";
import { PageHeader } from "@/core/ui/page-header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getSessionActivities } from "@/features/auth/lib/auth-repository";
import { ToolForm } from "@/features/inventory/components/tool-form";
import { ToolList } from "@/features/inventory/components/tool-list";
import type { ToolProfile } from "@/features/inventory/types";

export function AddItemsPageContent() {
  const { session } = useAuth();
  const toolkeeperActivities = useLiveQuery(
    () => session?.role === "toolkeeper" ? getSessionActivities(session.sessionId) : Promise.resolve([]),
    [session],
    [],
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolProfile | undefined>();
  const editableToolIds = useMemo(
    () =>
      new Set(
        toolkeeperActivities
          .filter((activity) => activity.activityType === "tool_created")
          .map((activity) => Number(activity.entityId)),
      ),
    [toolkeeperActivities],
  );

  function openCreateToolDialog() {
    setSelectedTool(undefined);
    setIsFormOpen(true);
  }

  function openEditToolDialog(tool: ToolProfile) {
    if (session?.role === "toolkeeper" && !editableToolIds.has(tool.id)) {
      return;
    }

    setSelectedTool(tool);
    setIsFormOpen(true);
  }

  function closeToolDialog() {
    setIsFormOpen(false);
    setSelectedTool(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Manage Items"
        description="Register barcode-labeled tools, maintain inventory records, and print labels directly from the catalog."
        actions={
          <>
            {session?.role === "admin" ? (
              <CsvTransferActions
                label="tools"
                onExport={exportToolsCsv}
                onImport={importToolsCsv}
              />
            ) : null}
            <Button type="button" className="gap-2 px-5" onClick={openCreateToolDialog}>
              <PlusIcon className="h-4 w-4" />
              Add Tool
            </Button>
          </>
        }
      />

      <ToolList
        allowDelete={session?.role === "admin"}
        canEdit={(tool) => session?.role !== "toolkeeper" || editableToolIds.has(tool.id)}
        onEdit={openEditToolDialog}
      />

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsFormOpen(true);
            return;
          }

          closeToolDialog();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTool ? "Edit Registered Tool" : "Add Tool"}</DialogTitle>
            <DialogDescription>
              {selectedTool
                ? "Update the tool details while keeping the assigned barcode fixed."
                : "Register a new laboratory tool and prepare its barcode label for printing."}
            </DialogDescription>
          </DialogHeader>
          <ToolForm
            key={selectedTool?.id ?? "create"}
            tool={selectedTool}
            activitySessionId={session?.role === "toolkeeper" ? session.sessionId : undefined}
            onSuccess={(mode) => {
              if (mode === "update") {
                closeToolDialog();
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
