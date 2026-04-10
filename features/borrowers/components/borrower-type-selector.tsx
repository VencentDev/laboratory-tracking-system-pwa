"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/core/lib/utils";

type BorrowerType = "student" | "instructor" | "staff";

type BorrowerTypeSelectorProps = {
  value: BorrowerType;
  onChange: (value: BorrowerType) => void;
  disabled?: boolean;
};

const borrowerTypeOptions: Array<{ value: BorrowerType; label: string }> = [
  { value: "student", label: "Student" },
  { value: "instructor", label: "Instructor" },
  { value: "staff", label: "Staff" },
];

export function BorrowerTypeSelector({
  value,
  onChange,
  disabled = false,
}: BorrowerTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    return borrowerTypeOptions.find((option) => option.value === value)?.label ?? "Student";
  }, [value]);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        const nextFocusedElement = event.relatedTarget;

        if (nextFocusedElement instanceof Node && event.currentTarget.contains(nextFocusedElement)) {
          return;
        }

        setIsOpen(false);
      }}
    >
      <button
        id="borrower-type"
        type="button"
        disabled={disabled}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-border/80 bg-background/90 px-4 py-2 text-left text-sm shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-foreground/15 focus-visible:border-foreground/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50"
        onClick={() => setIsOpen((currentState) => !currentState)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }

          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-muted-foreground/80 transition-colors duration-150" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 origin-top overflow-hidden rounded-[calc(var(--radius-xl)+4px)] border border-border/70 bg-card/95 shadow-soft backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
          <div className="p-2">
            {borrowerTypeOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm text-foreground/90 transition-all duration-150 ease-out hover:bg-muted hover:text-foreground",
                    isSelected && "bg-muted text-foreground",
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
