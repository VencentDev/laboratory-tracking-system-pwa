"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";

import { cn } from "@/core/lib/utils";
import { BorrowerAvatar } from "@/features/borrowers/components/borrower-avatar";
import type { BorrowerProfile } from "@/features/borrowers/types";

type BorrowerSelectorProps = {
  borrowers: BorrowerProfile[];
  selectedBorrowerId: string;
  onBorrowerChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
};

function formatBorrowerLabel(borrower: BorrowerProfile) {
  return `${borrower.name} (${borrower.schoolId})`;
}

export function BorrowerSelector({
  borrowers,
  selectedBorrowerId,
  onBorrowerChange,
  disabled = false,
  isLoading = false,
}: BorrowerSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedBorrower = borrowers.find((borrower) => borrower.id === selectedBorrowerId);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredBorrowers = normalizedQuery
    ? borrowers.filter((borrower) =>
        `${borrower.name} ${borrower.schoolId}`.toLowerCase().includes(normalizedQuery),
      )
    : borrowers;
  const inputValue = isOpen ? query : selectedBorrower ? formatBorrowerLabel(selectedBorrower) : "";

  function handleSelect(borrowerId: string) {
    onBorrowerChange(borrowerId);
    setIsOpen(false);

    if (!borrowerId) {
      setQuery("");
      return;
    }

    const borrower = borrowers.find((item) => item.id === borrowerId);
    setQuery(borrower ? formatBorrowerLabel(borrower) : "");
  }

  function openSelector() {
    setQuery(selectedBorrower ? formatBorrowerLabel(selectedBorrower) : "");
    setIsOpen(true);
  }

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
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80 transition-colors duration-150" />
        <input
          id="borrower-id"
          type="text"
          value={inputValue}
          onClick={openSelector}
          onChange={(event) => {
            const nextQuery = event.target.value;

            setQuery(nextQuery);
            setIsOpen(true);

            if (!nextQuery.trim() && selectedBorrowerId) {
              onBorrowerChange("");
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              openSelector();
            }
          }}
          placeholder={isLoading ? "Loading borrowers..." : "Search by name or school ID"}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className="flex h-11 w-full rounded-xl border border-border/80 bg-background/90 py-2 pl-11 pr-11 text-sm shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-muted-foreground/80 hover:border-foreground/15 focus-visible:border-foreground/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50"
        />
        <ChevronsUpDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80 transition-colors duration-150" />
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 origin-top overflow-hidden rounded-[calc(var(--radius-xl)+4px)] border border-border/70 bg-card/95 shadow-soft backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
          <div className="max-h-72 overflow-y-auto p-2">
            <button
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm text-foreground/90 transition-all duration-150 ease-out hover:bg-muted hover:text-foreground",
                !selectedBorrowerId && "bg-muted text-foreground",
              )}
              onClick={() => handleSelect("")}
            >
              <span>No borrower selected</span>
              {!selectedBorrowerId ? <CheckIcon className="h-4 w-4" /> : null}
            </button>

            {filteredBorrowers.length ? (
              filteredBorrowers.map((borrower) => {
                const isSelected = borrower.id === selectedBorrowerId;

                return (
                  <button
                    key={borrower.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-foreground/90 transition-all duration-150 ease-out hover:bg-muted hover:text-foreground",
                      isSelected && "bg-muted text-foreground",
                    )}
                    onClick={() => handleSelect(borrower.id)}
                  >
                    <BorrowerAvatar className="h-9 w-9 text-xs ring-1 ring-border/60" image={borrower.image} name={borrower.name} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{borrower.name}</div>
                      <div className="truncate text-xs text-muted-foreground/90">{borrower.schoolId}</div>
                    </div>
                    {isSelected ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No borrowers match that search.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
