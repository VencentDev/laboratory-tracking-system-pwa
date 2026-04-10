"use client";

import * as React from "react";
import { useEffect } from "react";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { XIcon } from "lucide-react";

import { Command, CommandGroup, CommandItem, CommandList } from "@/core/ui/command";
import { cn } from "@/core/lib/utils";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;
  [key: string]: string | boolean | undefined;
}

interface GroupOption {
  [key: string]: Option[];
}

interface MultipleSelectorProps {
  value?: Option[];
  defaultOptions?: Option[];
  options?: Option[];
  placeholder?: string;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  delay?: number;
  triggerSearchOnFocus?: boolean;
  onSearch?: (value: string) => Promise<Option[]>;
  onSearchSync?: (value: string) => Option[];
  onChange?: (options: Option[]) => void;
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  selectFirstItem?: boolean;
  creatable?: boolean;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
  hideClearAllButton?: boolean;
}

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (!options.length) {
    return {};
  }

  if (!groupBy) {
    return { "": options };
  }

  const groupOption: GroupOption = {};

  options.forEach((option) => {
    const key = (option[groupBy] as string) || "";

    if (!groupOption[key]) {
      groupOption[key] = [];
    }

    groupOption[key].push(option);
  });

  return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption;

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter((val) => !picked.find((pickedOption) => pickedOption.value === val.value));
  }

  return cloneOption;
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (value.some((option) => targetOption.find((pickedOption) => pickedOption.value === option.value))) {
      return true;
    }
  }

  return false;
}

const CommandEmpty = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) {
    return null;
  }

  return <div className={cn("px-2 py-4 text-center text-sm", className)} cmdk-empty="" role="presentation" {...props} />;
};

CommandEmpty.displayName = "CommandEmpty";

export function MultipleSelector({
  value,
  onChange,
  placeholder,
  defaultOptions: arrayDefaultOptions = [],
  options: arrayOptions,
  delay = 500,
  onSearch,
  onSearchSync,
  loadingIndicator,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  disabled,
  groupBy,
  className,
  badgeClassName,
  selectFirstItem = true,
  creatable = false,
  triggerSearchOnFocus = false,
  commandProps,
  inputProps,
  hideClearAllButton = false,
}: MultipleSelectorProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [onScrollbar, setOnScrollbar] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [internalSelected, setInternalSelected] = React.useState<Option[]>(value || []);
  const [asyncOptions, setAsyncOptions] = React.useState<GroupOption | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const debouncedSearchTerm = useDebounce(inputValue, delay);
  const selected = value ?? internalSelected;
  const baseOptions = React.useMemo(
    () => transToGroupOption(arrayOptions ?? arrayDefaultOptions, groupBy),
    [arrayDefaultOptions, arrayOptions, groupBy],
  );
  const syncOptions = React.useMemo(() => {
    if (!onSearchSync || !open || !(triggerSearchOnFocus || debouncedSearchTerm)) {
      return null;
    }

    return transToGroupOption(onSearchSync(debouncedSearchTerm) || [], groupBy);
  }, [debouncedSearchTerm, groupBy, onSearchSync, open, triggerSearchOnFocus]);
  const options = syncOptions ?? asyncOptions ?? baseOptions;

  const handleClickOutside = React.useCallback((event: MouseEvent | TouchEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
      inputRef.current.blur();
    }
  }, []);

  const handleUnselect = React.useCallback(
    (option: Option) => {
      const newOptions = selected.filter((item) => item.value !== option.value);
      if (value === undefined) {
        setInternalSelected(newOptions);
      }
      onChange?.(newOptions);
    },
    [onChange, selected, value],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && input.value === "" && selected.length > 0) {
        const lastSelectedOption = selected[selected.length - 1];

        if (!lastSelectedOption.fixed) {
          handleUnselect(lastSelectedOption);
        }
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [handleUnselect, selected],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchend", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [handleClickOutside, open]);

  useEffect(() => {
    const doSearch = async () => {
      setIsLoading(true);
      const result = await onSearch?.(debouncedSearchTerm);
      setAsyncOptions(transToGroupOption(result || [], groupBy));
      setIsLoading(false);
    };

    if (!onSearch || !open) {
      return;
    }

    if (triggerSearchOnFocus || debouncedSearchTerm) {
      void doSearch();
    }
  }, [debouncedSearchTerm, groupBy, onSearch, open, triggerSearchOnFocus]);

  const CreatableItem = () => {
    if (!creatable) {
      return undefined;
    }

    if (isOptionsExist(options, [{ value: inputValue, label: inputValue }]) || selected.find((item) => item.value === inputValue)) {
      return undefined;
    }

    const item = (
      <CommandItem
        value={inputValue}
        className="cursor-pointer"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onSelect={(currentValue) => {
          if (selected.length >= maxSelected) {
            onMaxSelected?.(selected.length);
            return;
          }

          setInputValue("");
          const newOptions = [...selected, { value: currentValue, label: currentValue }];
          if (value === undefined) {
            setInternalSelected(newOptions);
          }
          onChange?.(newOptions);
        }}
      >
        {`Create "${inputValue}"`}
      </CommandItem>
    );

    if (!onSearch && inputValue.length > 0) {
      return item;
    }

    if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
      return item;
    }

    return undefined;
  };

  const EmptyItem = React.useCallback(() => {
    if (!emptyIndicator) {
      return undefined;
    }

    if (onSearch && !creatable && Object.keys(options).length === 0) {
      return (
        <CommandItem value="-" disabled>
          {emptyIndicator}
        </CommandItem>
      );
    }

    return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
  }, [creatable, emptyIndicator, onSearch, options]);

  const selectables = React.useMemo(() => removePickedOption(options, selected), [options, selected]);
  const commandFilter = commandProps?.filter
    ?? (creatable
      ? (currentValue: string, search: string) => (currentValue.toLowerCase().includes(search.toLowerCase()) ? 1 : -1)
      : undefined);

  return (
    <Command
      ref={dropdownRef}
      {...commandProps}
      onKeyDown={(event) => {
        handleKeyDown(event);
        commandProps?.onKeyDown?.(event);
      }}
      className={cn("h-auto overflow-visible bg-transparent", commandProps?.className)}
      shouldFilter={commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch}
      filter={commandFilter}
    >
      <div
        className={cn(
          "relative min-h-10 rounded-xl border border-border/80 bg-background/90 text-sm shadow-sm transition-[color,box-shadow,border-color,background-color] outline-none focus-within:border-foreground/20 focus-within:ring-4 focus-within:ring-ring/15",
          {
            "cursor-text p-1": !disabled && selected.length !== 0,
          },
          !hideClearAllButton && "pr-9",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
          className,
        )}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus();
          }
        }}
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative inline-flex h-7 items-center rounded-lg border border-border/70 bg-muted/70 px-2 pr-7 text-xs font-medium text-foreground transition-all",
                badgeClassName,
              )}
              data-fixed={option.fixed}
              data-disabled={disabled || undefined}
            >
              {option.label}
              <button
                type="button"
                className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 right-0 flex size-7 items-center justify-center rounded-r-lg border border-transparent p-0 outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleUnselect(option);
                  }
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={() => handleUnselect(option)}
                aria-label="Remove"
              >
                <XIcon size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
          <CommandPrimitive.Input
            {...inputProps}
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={(currentValue) => {
              setInputValue(currentValue);

              if (!currentValue.trim() && !triggerSearchOnFocus) {
                setAsyncOptions(null);
              }

              inputProps?.onValueChange?.(currentValue);
            }}
            onBlur={(event) => {
              if (!onScrollbar) {
                setOpen(false);

                if (!triggerSearchOnFocus) {
                  setAsyncOptions(null);
                }
              }

              inputProps?.onBlur?.(event);
            }}
            onFocus={(event) => {
              setOpen(true);

              if (triggerSearchOnFocus) {
                void onSearch?.(debouncedSearchTerm);
              }

              inputProps?.onFocus?.(event);
            }}
            placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? "" : placeholder}
            className={cn(
              "placeholder:text-muted-foreground/70 flex-1 bg-transparent outline-none disabled:cursor-not-allowed",
              {
                "w-full px-3 py-2": selected.length === 0,
                "ml-1": selected.length !== 0,
              },
              inputProps?.className,
            )}
          />
          <button
            type="button"
            onClick={() => {
              const fixedOptions = selected.filter((item) => item.fixed);

              if (value === undefined) {
                setInternalSelected(fixedOptions);
              }

              onChange?.(fixedOptions);
            }}
            className={cn(
              "text-muted-foreground/80 hover:text-foreground absolute right-0 top-0 flex size-9 items-center justify-center rounded-lg border border-transparent outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
              (hideClearAllButton ||
                disabled ||
                selected.length < 1 ||
                selected.filter((item) => item.fixed).length === selected.length) &&
                "hidden",
            )}
            aria-label="Clear all"
          >
            <XIcon size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div
          className={cn(
            "absolute top-2 z-10 w-full overflow-hidden rounded-[calc(var(--radius-xl)+2px)] border border-border/70 bg-popover/95 shadow-soft backdrop-blur-xl",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=open]:animate-in",
            !open && "hidden",
          )}
          data-state={open ? "open" : "closed"}
        >
          {open ? (
            <CommandList
              className="outline-none"
              onMouseLeave={() => {
                setOnScrollbar(false);
              }}
              onMouseEnter={() => {
                setOnScrollbar(true);
              }}
              onMouseUp={() => {
                inputRef.current?.focus();
              }}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  {EmptyItem()}
                  {CreatableItem()}
                  {!selectFirstItem ? <CommandItem value="-" className="hidden" /> : null}
                  {Object.entries(selectables).map(([key, dropdowns]) => (
                    <CommandGroup key={key} heading={key}>
                      {dropdowns.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disable}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onSelect={() => {
                            if (selected.length >= maxSelected) {
                              onMaxSelected?.(selected.length);
                              return;
                            }

                            setInputValue("");
                            const newOptions = [...selected, option];
                            if (value === undefined) {
                              setInternalSelected(newOptions);
                            }
                            onChange?.(newOptions);
                          }}
                          className={cn(option.disable && "pointer-events-none cursor-not-allowed opacity-50")}
                        >
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          ) : null}
        </div>
      </div>
    </Command>
  );
}
