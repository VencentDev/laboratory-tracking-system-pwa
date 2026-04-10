"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";

import { cn } from "@/core/lib/utils";

type CategorySelectorProps = {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function CategorySelector({ categories, value, onChange, disabled = false }: CategorySelectorProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = normalizedQuery
    ? categories.filter((category) => category.toLowerCase().includes(normalizedQuery))
    : categories;
  const shouldShowDropdown = isOpen && (!normalizedQuery || filteredCategories.length > 0);
  const inputValue = isOpen ? query : value;

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setQuery(nextValue);
    setIsOpen(false);
  }

  function openSelector() {
    setQuery(value);
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
          id="tool-category"
          type="text"
          value={inputValue}
          onClick={openSelector}
          onChange={(event) => {
            const nextQuery = event.target.value;

            setQuery(nextQuery);
            onChange(nextQuery);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              openSelector();
            }
          }}
          placeholder="Select or create a category"
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className="flex h-11 w-full rounded-xl border border-border/80 bg-background/90 py-2 pl-11 pr-11 text-sm shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-muted-foreground/80 hover:border-foreground/15 focus-visible:border-foreground/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50"
        />
        <ChevronsUpDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80 transition-colors duration-150" />
      </div>

      {shouldShowDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 origin-top overflow-hidden rounded-[calc(var(--radius-xl)+4px)] border border-border/70 bg-card/95 shadow-soft backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
          <div className="max-h-72 overflow-y-auto p-2">
            {!normalizedQuery ? (
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm text-foreground/90 transition-all duration-150 ease-out hover:bg-muted hover:text-foreground",
                  !value.trim() && "bg-muted text-foreground",
                )}
                onClick={() => handleSelect("")}
              >
                <span>Leave uncategorized</span>
                {!value.trim() ? <CheckIcon className="h-4 w-4" /> : null}
              </button>
            ) : null}

            {filteredCategories.length ? (
              filteredCategories.map((category) => {
                const isSelected = category.toLowerCase() === value.trim().toLowerCase();

                return (
                  <button
                  key={category}
                  type="button"
                  className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm text-foreground/90 transition-all duration-150 ease-out hover:bg-muted hover:text-foreground",
                      isSelected && "bg-muted text-foreground",
                    )}
                    onClick={() => handleSelect(category)}
                  >
                    <span className="truncate">{category}</span>
                    {isSelected ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })
            ) : !normalizedQuery ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No categories have been added yet.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
