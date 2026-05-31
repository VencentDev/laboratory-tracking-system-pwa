"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { PrinterIcon, SearchIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import type { DateRangeValue } from "@/core/lib/date-range";
import { Button } from "@/core/ui/button";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { DateRangeFilter } from "@/core/ui/date-range-filter";
import { Input } from "@/core/ui/input";
import { PageHeader } from "@/core/ui/page-header";
import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import { AcknowledgementSlipPrintBatchView } from "@/features/reports/components/acknowledgement-slip-print-batch-view";
import {
  getCurrentMonthDateRange,
  listAcknowledgementReportGroups,
} from "@/features/reports/lib/acknowledgement-report-repository";
import { printAcknowledgementReports } from "@/features/reports/lib/acknowledgement-report-print";
import type { AcknowledgementReportGroup } from "@/features/reports/types";

export function AcknowledgementReportsPageContent() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => getCurrentMonthDateRange());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const groups = useLiveQuery(
    () => listAcknowledgementReportGroups(dateRange),
    [dateRange.from?.getTime(), dateRange.to?.getTime()],
    [],
  );
  const filteredGroups = useMemo(
    () => filterGroups(groups, searchQuery),
    [groups, searchQuery],
  );
  const selectedReportIdSet = useMemo(() => new Set(selectedReportIds), [selectedReportIds]);
  const selectedGroups = useMemo(
    () => filteredGroups.filter((group) => selectedReportIdSet.has(group.id)),
    [filteredGroups, selectedReportIdSet],
  );
  const allFilteredSelected = filteredGroups.length > 0 && selectedGroups.length === filteredGroups.length;
  const someFilteredSelected = selectedGroups.length > 0 && !allFilteredSelected;
  const totalItemCount = filteredGroups.reduce((total, group) => total + group.items.length, 0);

  useEffect(() => {
    if (!selectAllCheckboxRef.current) {
      return;
    }

    selectAllCheckboxRef.current.indeterminate = someFilteredSelected;
  }, [someFilteredSelected]);

  function handleDateRangeChange(nextDateRange: DateRangeValue) {
    setDateRange(nextDateRange.from || nextDateRange.to ? nextDateRange : getCurrentMonthDateRange());
    setSelectedReportIds([]);
  }

  function toggleReportSelection(reportId: string) {
    setSelectedReportIds((currentReportIds) =>
      currentReportIds.includes(reportId)
        ? currentReportIds.filter((currentReportId) => currentReportId !== reportId)
        : [...currentReportIds, reportId],
    );
  }

  function toggleSelectAllFilteredReports(shouldSelectAll: boolean) {
    if (!shouldSelectAll) {
      setSelectedReportIds((currentReportIds) =>
        currentReportIds.filter((reportId) => !filteredGroups.some((group) => group.id === reportId)),
      );
      return;
    }

    setSelectedReportIds((currentReportIds) => {
      const nextReportIds = new Set(currentReportIds);

      for (const group of filteredGroups) {
        nextReportIds.add(group.id);
      }

      return Array.from(nextReportIds);
    });
  }

  function handlePrintSelected() {
    if (selectedGroups.length === 0) {
      toast.info("Select at least one acknowledgement report to print.");
      return;
    }

    if (!printAcknowledgementReports()) {
      toast.error("Acknowledgement reports can only be printed in the browser.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Acknowledgement Reports"
        description="Print monthly or custom-range acknowledgement slips grouped by borrower."
        actions={
          <Button type="button" disabled={selectedGroups.length === 0} onClick={handlePrintSelected}>
            <PrinterIcon className="h-4 w-4" />
            Print Selected
            {selectedGroups.length ? ` (${selectedGroups.length})` : ""}
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile label="Borrower Groups" value={filteredGroups.length} />
        <SummaryTile label="Borrowed Items" value={totalItemCount} />
        <SummaryTile label="Selected Slips" value={selectedGroups.length} />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:min-w-[280px] lg:flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by borrower, school ID, barcode, or tool..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 bg-background pl-9 pr-10"
            />
            {searchQuery ? (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
              >
                <XIcon className="size-4" />
              </button>
            ) : null}
          </div>
          <DateRangeFilter
            title="Acknowledgement Date"
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full lg:max-w-[440px]"
            boxed={false}
            showTitle={false}
          />
        </div>
      </div>

      {filteredGroups.length ? (
        <DataTableSurface>
          <DataTable className="min-w-[980px]">
            <thead>
              <tr>
                <DataTableHeaderCell className="w-14 text-center">
                  <div className="flex justify-center">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      className="h-4 w-4 rounded border-border/80 text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                      checked={allFilteredSelected}
                      onChange={(event) => toggleSelectAllFilteredReports(event.target.checked)}
                      aria-label="Select all acknowledgement reports"
                    />
                  </div>
                </DataTableHeaderCell>
                <DataTableHeaderCell>Slip No.</DataTableHeaderCell>
                <DataTableHeaderCell>Borrower</DataTableHeaderCell>
                <DataTableHeaderCell>School ID</DataTableHeaderCell>
                <DataTableHeaderCell>Issued By</DataTableHeaderCell>
                <DataTableHeaderCell>Coverage</DataTableHeaderCell>
                <DataTableHeaderCell>Items</DataTableHeaderCell>
                <DataTableHeaderCell>First Borrowed</DataTableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group) => (
                <tr key={group.id}>
                  <DataTableCell className="text-center">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border/80 text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                        checked={selectedReportIdSet.has(group.id)}
                        onChange={() => toggleReportSelection(group.id)}
                        aria-label={`Select acknowledgement report for ${group.borrowerName}`}
                      />
                    </div>
                  </DataTableCell>
                  <DataTableCell className="font-mono text-xs text-foreground">{group.slipNumber}</DataTableCell>
                  <DataTableCell className="font-medium text-foreground">{group.borrowerName}</DataTableCell>
                  <DataTableCell>{group.borrowerSchoolId ?? "N/A"}</DataTableCell>
                  <DataTableCell>{formatIssuedBySummary(group)}</DataTableCell>
                  <DataTableCell>{formatDateRangeLabel(group.dateFrom, group.dateTo)}</DataTableCell>
                  <DataTableCell>{group.items.length}</DataTableCell>
                  <DataTableCell>{formatRecordedAt(group.items[0].borrowedAt)}</DataTableCell>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableSurface>
      ) : (
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No borrowed-item acknowledgement reports match the selected filters.
        </div>
      )}

      <AcknowledgementSlipPrintBatchView reports={selectedGroups} preparedBy="Admin" />
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">{value}</p>
    </div>
  );
}

function filterGroups(groups: AcknowledgementReportGroup[], searchQuery: string) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return groups;
  }

  return groups.filter((group) => {
    const itemMatches = group.items.some(
      (item) =>
        item.toolName.toLowerCase().includes(normalizedSearchQuery) ||
        item.barcode.toLowerCase().includes(normalizedSearchQuery) ||
        (item.category?.toLowerCase().includes(normalizedSearchQuery) ?? false) ||
        (item.issuedByName?.toLowerCase().includes(normalizedSearchQuery) ?? false),
    );

    return (
      group.slipNumber.toLowerCase().includes(normalizedSearchQuery) ||
      group.borrowerName.toLowerCase().includes(normalizedSearchQuery) ||
      (group.borrowerSchoolId?.toLowerCase().includes(normalizedSearchQuery) ?? false) ||
      itemMatches
    );
  });
}

function formatDateRangeLabel(from: Date, to: Date) {
  if (from.toDateString() === to.toDateString()) {
    return from.toLocaleDateString();
  }

  return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
}

function formatIssuedBySummary(group: AcknowledgementReportGroup) {
  if (group.issuedByNames.length === 0) {
    return "Unknown";
  }

  if (group.issuedByNames.length === 1) {
    return group.issuedByNames[0];
  }

  return `${group.issuedByNames.length} toolkeepers`;
}
