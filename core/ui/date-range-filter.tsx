"use client";

import { formatDateRange } from "little-date";
import { ChevronDownIcon, XIcon } from "lucide-react";

import { cn } from "@/core/lib/utils";
import type { DateRangeValue } from "@/core/lib/date-range";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DateRangeFilterProps = {
  title?: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
  boxed?: boolean;
  showTitle?: boolean;
};

export function DateRangeFilter({
  title = "Date Range",
  value,
  onChange,
  className,
  boxed = true,
  showTitle = true,
}: DateRangeFilterProps) {
  const hasValue = Boolean(value.from || value.to);
  const titleId = title.toLowerCase().replace(/\s+/g, "-");
  const selectedRange = value.from
    ? { from: value.from, to: value.to }
    : undefined;
  const displayValue = value.from && value.to
    ? formatDateRange(value.from, value.to, { includeTime: false })
    : value.from
      ? value.from.toLocaleDateString()
      : "Select dates";

  return (
    <div className={cn(boxed && "rounded-[calc(var(--radius-xl)+2px)] border border-border/70 bg-card/80 p-3.5 shadow-soft", className)}>
      <div className="space-y-2">
        {showTitle ? (
          <Label htmlFor={titleId} className="px-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {title}
          </Label>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" id={titleId} className="w-full justify-between font-normal sm:flex-1">
                {displayValue}
                <ChevronDownIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={(nextRange) => onChange(nextRange ? { from: nextRange.from, to: nextRange.to } : {})}
              />
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => onChange({})}
            disabled={!hasValue}
          >
            <XIcon className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
