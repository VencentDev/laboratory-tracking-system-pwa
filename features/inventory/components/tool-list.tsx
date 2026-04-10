"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PencilIcon, SearchIcon, Trash2Icon, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/core/ui/button";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/core/ui/dialog";
import { type Option } from "@/core/ui/multiple-selector";
import { Input } from "@/core/ui/input";
import { TablePagination } from "@/core/ui/table-pagination";
import { BarcodeDisplay } from "@/features/inventory/components/barcode-display";
import { BarcodePrintView } from "@/features/inventory/components/barcode-print-view";
import { ToolTableFilters } from "@/features/inventory/components/tool-table-filters";
import { formatToolStatus, getToolStatusClasses } from "@/features/inventory/components/tool-card";
import { useTools } from "@/features/inventory/hooks/use-tools";
import { deleteTool } from "@/features/inventory/lib/tool-repository";
import type { ToolProfile, ToolStatus } from "@/features/inventory/types";

type ToolListProps = {
  onEdit?: (tool: ToolProfile) => void;
};

const PAGE_SIZE = 10;

export function ToolList({ onEdit }: ToolListProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingToolId, setDeletingToolId] = useState<number | null>(null);
  const [previewTool, setPreviewTool] = useState<ToolProfile | null>(null);
  const [shouldPrintPreview, setShouldPrintPreview] = useState(false);
  const [batchPrintTools, setBatchPrintTools] = useState<ToolProfile[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<Option[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | ToolStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToolIds, setSelectedToolIds] = useState<number[]>([]);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const { data: tools, isLoading } = useTools();

  function handleCategoryChange(nextCategoryFilter: Option[]) {
    setCurrentPage(1);
    setCategoryFilter(nextCategoryFilter);
  }

  function handleStatusChange(nextStatusFilter: "all" | ToolStatus) {
    setCurrentPage(1);
    setStatusFilter(nextStatusFilter);
  }

  function handleSearchChange(value: string) {
    setCurrentPage(1);
    setSearchQuery(value);
  }

  const filteredTools = useMemo(
    () =>
      (tools ?? []).filter((tool) => {
        const selectedCategoryValues = categoryFilter.map((option) => option.value);
        const matchesCategory =
          selectedCategoryValues.length === 0
            ? true
            : selectedCategoryValues.some((value) =>
                value === "__uncategorized__"
                  ? !tool.category?.trim()
                  : tool.category?.trim().toLowerCase() === value.toLowerCase(),
              );
        const matchesStatus = statusFilter === "all" ? true : tool.currentStatus === statusFilter;
        
        let matchesSearch = true;
        if (searchQuery.trim() !== "") {
          const searchLower = searchQuery.toLowerCase();
          matchesSearch =
            tool.name.toLowerCase().includes(searchLower) ||
            tool.barcode.toLowerCase().includes(searchLower) ||
            (tool.category?.toLowerCase().includes(searchLower) ?? false);
        }

        return matchesCategory && matchesStatus && matchesSearch;
      }),
    [categoryFilter, statusFilter, searchQuery, tools],
  );
  const totalPages = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const selectedToolIdSet = useMemo(() => new Set(selectedToolIds), [selectedToolIds]);
  const selectedFilteredTools = useMemo(
    () => filteredTools.filter((tool) => selectedToolIdSet.has(tool.id)),
    [filteredTools, selectedToolIdSet],
  );
  const allFilteredSelected = filteredTools.length > 0 && selectedFilteredTools.length === filteredTools.length;
  const someFilteredSelected = selectedFilteredTools.length > 0 && !allFilteredSelected;

  useEffect(() => {
    if (!previewTool || !shouldPrintPreview) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.print();
      setShouldPrintPreview(false);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [previewTool, shouldPrintPreview]);

  useEffect(() => {
    if (!batchPrintTools.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.print();
      setBatchPrintTools([]);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [batchPrintTools]);

  useEffect(() => {
    if (!selectAllCheckboxRef.current) {
      return;
    }

    selectAllCheckboxRef.current.indeterminate = someFilteredSelected;
  }, [someFilteredSelected]);

  function openBarcodePreview(tool: ToolProfile) {
    setShouldPrintPreview(false);
    setPreviewTool(tool);
  }

  function toggleToolSelection(toolId: number) {
    setSelectedToolIds((currentSelectedToolIds) =>
      currentSelectedToolIds.includes(toolId)
        ? currentSelectedToolIds.filter((currentToolId) => currentToolId !== toolId)
        : [...currentSelectedToolIds, toolId],
    );
  }

  function toggleSelectAllFilteredTools(shouldSelectAll: boolean) {
    if (!shouldSelectAll) {
      setSelectedToolIds((currentSelectedToolIds) =>
        currentSelectedToolIds.filter((toolId) => !filteredTools.some((tool) => tool.id === toolId)),
      );
      return;
    }

    setSelectedToolIds((currentSelectedToolIds) => {
      const nextSelectedToolIds = new Set(currentSelectedToolIds);

      for (const tool of filteredTools) {
        nextSelectedToolIds.add(tool.id);
      }

      return Array.from(nextSelectedToolIds);
    });
  }

  async function handleDelete(tool: ToolProfile) {
    const confirmed = window.confirm(`Delete ${tool.name} (${tool.barcode}) from the inventory catalog?`);

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setDeletingToolId(tool.id);

    try {
      const deletedTool = await deleteTool(tool.id);

      if (!deletedTool) {
        setMessage({
          type: "error",
          text: "The tool could not be deleted. Try again once local storage is available.",
        });
        return;
      }

      setSelectedToolIds((currentSelectedToolIds) =>
        currentSelectedToolIds.filter((currentToolId) => currentToolId !== tool.id),
      );
      setMessage({
        type: "success",
        text: `${deletedTool.name} was deleted from the inventory list.`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "The tool could not be deleted. Try again once local storage is available.",
      });
    } finally {
      setDeletingToolId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSurface>
          <DataTable className="min-w-[1080px]">
            <thead>
              <tr>
                <DataTableHeaderCell>Tool</DataTableHeaderCell>
                <DataTableHeaderCell>Barcode</DataTableHeaderCell>
                <DataTableHeaderCell>Category</DataTableHeaderCell>
                <DataTableHeaderCell>Status</DataTableHeaderCell>
                <DataTableHeaderCell>Description</DataTableHeaderCell>
                <DataTableHeaderCell>Actions</DataTableHeaderCell>
              </tr>
            </thead>
          </DataTable>
        </DataTableSurface>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!tools?.length) {
    return (
      <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
        No tools have been registered yet. Add the first barcode-labeled item to start the inventory catalog.
      </div>
    );
  }

  const paginatedTools = filteredTools.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
              : "border-destructive/30 bg-destructive/15 text-destructive-foreground"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {/* --- Filter Container --- */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80 lg:w-60 shrink-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by tool, barcode, or category..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-12 h-10 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="w-full md:flex-1 lg:flex-initial lg:min-w-0">
            <ToolTableFilters
              tools={tools ?? []}
              categoryFilter={categoryFilter}
              onCategoryChange={handleCategoryChange}
              statusFilter={statusFilter}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          {/* Print button */}
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto lg:self-stretch bg-background shrink-0"
            disabled={selectedFilteredTools.length === 0}
            onClick={() => setBatchPrintTools(selectedFilteredTools)}
          >
            Print Selected Barcodes
            {selectedFilteredTools.length ? ` (${selectedFilteredTools.length})` : ""}
          </Button>
        </div>
      </div>
      {/* --- End Filter Container --- */}

      {!filteredTools.length ? (
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No tools match the selected category and status filters.
        </div>
      ) : null}

      {filteredTools.length ? (
        <DataTableSurface>
          <DataTable className="min-w-[1080px]">
            <thead>
              <tr>
                <DataTableHeaderCell className="w-14 text-center">
                  <div className="flex justify-center">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      className="h-4 w-4 rounded border-border/80 text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                      checked={allFilteredSelected}
                      onChange={(event) => toggleSelectAllFilteredTools(event.target.checked)}
                      aria-label="Select all filtered tools"
                    />
                  </div>
                </DataTableHeaderCell>
                <DataTableHeaderCell>Tool</DataTableHeaderCell>
                <DataTableHeaderCell>Barcode</DataTableHeaderCell>
                <DataTableHeaderCell>Category</DataTableHeaderCell>
                <DataTableHeaderCell>Status</DataTableHeaderCell>
                <DataTableHeaderCell>Description</DataTableHeaderCell>
                <DataTableHeaderCell className="text-center">Actions</DataTableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {paginatedTools.map((tool) => {
                const isDeleting = deletingToolId === tool.id;

                return (
                  <tr key={tool.id}>
                    <DataTableCell className="text-center">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border/80 text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                          checked={selectedToolIdSet.has(tool.id)}
                          onChange={() => toggleToolSelection(tool.id)}
                          aria-label={`Select ${tool.name}`}
                        />
                      </div>
                    </DataTableCell>
                    <DataTableCell className="font-medium text-foreground">{tool.name || "Unnamed tool"}</DataTableCell>
                    <DataTableCell>
                      <div className="flex justify-center overflow-hidden">
                        <button
                          type="button"
                          className="rounded-lg p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                          onClick={() => openBarcodePreview(tool)}
                          aria-label={`Preview barcode for ${tool.name}`}
                          title="Preview barcode"
                        >
                          <BarcodeDisplay showPrintButton={false} showValue={false} size="compact" value={tool.barcode} />
                        </button>
                      </div>
                    </DataTableCell>
                    <DataTableCell>{tool.category || "Uncategorized"}</DataTableCell>
                    <DataTableCell>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getToolStatusClasses(tool.currentStatus)}`}
                      >
                        {formatToolStatus(tool.currentStatus)}
                      </span>
                    </DataTableCell>
                    <DataTableCell>{tool.description || "No description provided."}</DataTableCell>
                    <DataTableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => onEdit?.(tool)}
                          aria-label={`Edit ${tool.name}`}
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={isDeleting}
                          onClick={() => void handleDelete(tool)}
                          aria-label={`Delete ${tool.name}`}
                          title="Delete"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </DataTableCell>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </DataTableSurface>
      ) : null}

      {filteredTools.length ? (
        <TablePagination
          currentPage={visiblePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}

      <Dialog
        open={Boolean(previewTool)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTool(null);
            setShouldPrintPreview(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">{previewTool?.name ?? "Tool Barcode"}</DialogTitle>
          <DialogDescription className="sr-only">
            Preview and print the selected tool barcode.
          </DialogDescription>
          {previewTool ? <BarcodeDisplay itemName={previewTool.name} value={previewTool.barcode} /> : null}
        </DialogContent>
      </Dialog>

      {batchPrintTools.length && typeof document !== "undefined"
        ? createPortal(<BarcodePrintView tools={batchPrintTools} />, document.body)
        : null}
    </div>
  );
}
