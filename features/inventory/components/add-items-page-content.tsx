"use client";

import { useState } from "react";
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
import { ToolForm } from "@/features/inventory/components/tool-form";
import { ToolList } from "@/features/inventory/components/tool-list";
import type { ToolProfile } from "@/features/inventory/types";

export function AddItemsPageContent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolProfile | undefined>();

  function openCreateToolDialog() {
    setSelectedTool(undefined);
    setIsFormOpen(true);
  }

  function openEditToolDialog(tool: ToolProfile) {
    setSelectedTool(tool);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Manage Items"
        description="Register barcode-labeled tools, maintain inventory records, and print labels directly from the catalog."
        actions={
          <>
            <CsvTransferActions
              label="tools"
              onExport={exportToolsCsv}
              onImport={importToolsCsv}
            />
            <Button type="button" className="gap-2 px-5" onClick={openCreateToolDialog}>
              <PlusIcon className="h-4 w-4" />
              Add Tool
            </Button>
          </>
        }
      />

      <ToolList onEdit={openEditToolDialog} />

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);

          if (!open) {
            setSelectedTool(undefined);
          }
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
          <ToolForm key={selectedTool?.id ?? "create"} tool={selectedTool} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
