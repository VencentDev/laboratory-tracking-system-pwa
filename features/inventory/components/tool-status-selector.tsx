"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatToolStatus } from "@/features/inventory/components/tool-card";
import type { ToolStatus } from "@/features/inventory/types";

type ToolStatusSelectorOption = {
  value: "all" | ToolStatus;
  label: string;
};

type ToolStatusSelectorProps = {
  value: "all" | ToolStatus;
  onChange: (value: "all" | ToolStatus) => void;
  options?: ToolStatusSelectorOption[];
  className?: string;
};

const defaultFilterOptions: ToolStatusSelectorOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "available", label: "Available" },
  { value: "borrowed", label: "Borrowed" },
  { value: "missing", label: "Missing" },
];

export function ToolStatusSelector({
  value,
  onChange,
  options = defaultFilterOptions,
  className,
}: ToolStatusSelectorProps) {
  const activeLabel = options.find((option) => option.value === value)?.label ?? formatToolStatus(value as ToolStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className ?? "w-full justify-between rounded-xl"}>
          <span>{activeLabel}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue) => onChange(nextValue as "all" | ToolStatus)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
