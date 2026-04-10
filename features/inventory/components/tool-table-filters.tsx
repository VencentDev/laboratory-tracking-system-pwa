"use client";

import { useMemo } from "react";

import { MultipleSelector, type Option } from "@/core/ui/multiple-selector";
import { ToolStatusSelector } from "@/features/inventory/components/tool-status-selector";
import { getCategoryOptions } from "@/features/inventory/lib/category-options";
import type { ToolProfile, ToolStatus } from "@/features/inventory/types";

type ToolTableFiltersProps = {
  tools: ToolProfile[];
  categoryFilter: Option[];
  onCategoryChange: (value: Option[]) => void;
  statusFilter?: "all" | ToolStatus;
  onStatusChange?: (value: "all" | ToolStatus) => void;
  showStatus?: boolean;
};

export function ToolTableFilters({
  tools,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  showStatus = true,
}: ToolTableFiltersProps) {
  const categoryOptions = useMemo(
    () => getCategoryOptions(tools),
    [tools],
  );

  const categoryFilterOptions = useMemo<Option[]>(
    () => [
      { value: "__uncategorized__", label: "Uncategorized" },
      ...categoryOptions.map((category) => ({
        value: category,
        label: category,
      })),
    ],
    [categoryOptions],
  );

  return (
    <div className={showStatus ? "grid gap-3 md:grid-cols-2 lg:grid-cols-[180px_160px]" : "grid gap-3"}>
      <MultipleSelector
        options={categoryFilterOptions}
        value={categoryFilter}
        onChange={onCategoryChange}
        placeholder="Filter categories"
        hidePlaceholderWhenSelected
        emptyIndicator={<div className="text-sm text-muted-foreground">No categories found.</div>}
        className="rounded-xl"
      />

      {showStatus && statusFilter && onStatusChange ? (
        <ToolStatusSelector
          value={statusFilter}
          onChange={onStatusChange}
        />
      ) : null}
    </div>
  );
}
