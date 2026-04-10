"use client";

import { useEffect, useMemo, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/core/lib/trpc-client";
import { Button } from "@/core/ui/button";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { TablePagination } from "@/core/ui/table-pagination";
import { BorrowerAvatar } from "@/features/borrowers/components/borrower-avatar";
import type { BorrowerProfile } from "@/features/borrowers/types";

type BorrowerListProps = {
  onEdit?: (borrower: BorrowerProfile) => void;
  searchQuery?: string;
  typeFilter?: string;
};

const PAGE_SIZE = 10;

export function BorrowerList({ onEdit, searchQuery = "", typeFilter = "all" }: BorrowerListProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const utils = trpc.useUtils();
  const { data: borrowers, isLoading } = trpc.borrowers.list.useQuery();
  const deleteBorrowerMutation = trpc.borrowers.delete.useMutation();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  const filteredBorrowers = useMemo(() => {
    if (!borrowers) return [];

    return borrowers
      .filter((borrower) => {
        if (typeFilter === "all") return true;
        return borrower.type === typeFilter;
      })
      .filter((borrower) => {
        if (searchQuery.trim() === "") return true;
        const searchLower = searchQuery.toLowerCase();
        return (
          borrower.name.toLowerCase().includes(searchLower) ||
          borrower.schoolId.toLowerCase().includes(searchLower) ||
          (borrower.program?.toLowerCase().includes(searchLower) ?? false)
        );
      });
  }, [borrowers, searchQuery, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBorrowers.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);

  async function handleDelete(borrower: BorrowerProfile) {
    const confirmed = window.confirm(`Delete ${borrower.name} (${borrower.schoolId}) from the borrower registry?`);

    if (!confirmed) {
      return;
    }

    setMessage(null);

    try {
      const deletedBorrower = await deleteBorrowerMutation.mutateAsync({ id: borrower.id });

      if (!deletedBorrower) {
        setMessage({
          type: "error",
          text: "The borrower could not be deleted. Try again once the database is available.",
        });
        return;
      }

      await utils.borrowers.list.invalidate();
      await utils.borrowers.byId.invalidate({ id: borrower.id });
      await utils.borrowers.bySchoolId.invalidate({ schoolId: borrower.schoolId });
      setMessage({
        type: "success",
        text: `${deletedBorrower.name} was removed from the borrower registry.`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "The borrower could not be deleted. Try again once the database is available.",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTableSurface>
          <DataTable>
            <thead>
              <tr>
                <DataTableHeaderCell className="text-left">Borrower</DataTableHeaderCell>
                <DataTableHeaderCell>Type</DataTableHeaderCell>
                <DataTableHeaderCell className="hidden md:table-cell">Program</DataTableHeaderCell>
                <DataTableHeaderCell className="hidden md:table-cell">Year</DataTableHeaderCell>
                <DataTableHeaderCell className="hidden md:table-cell">Section</DataTableHeaderCell>
                <DataTableHeaderCell className="hidden lg:table-cell">Contact</DataTableHeaderCell>
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

  if (!filteredBorrowers?.length) {
    return (
      <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
        {borrowers?.length
          ? "No borrowers match your current filters. Try adjusting your search or type filter."
          : "No borrower records exist yet. Record the first borrower to support laboratory accountability."}
      </div>
    );
  }

  const paginatedBorrowers = filteredBorrowers.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/15 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <DataTableSurface>
        <DataTable>
          <thead>
            <tr>
              <DataTableHeaderCell className="text-left">Borrower</DataTableHeaderCell>
              <DataTableHeaderCell>Type</DataTableHeaderCell>
              <DataTableHeaderCell className="hidden md:table-cell">Program</DataTableHeaderCell>
              <DataTableHeaderCell className="hidden md:table-cell">Year</DataTableHeaderCell>
              <DataTableHeaderCell className="hidden md:table-cell">Section</DataTableHeaderCell>
              <DataTableHeaderCell className="hidden lg:table-cell">Contact</DataTableHeaderCell>

              <DataTableHeaderCell className="text-center">Actions</DataTableHeaderCell>
            </tr>
          </thead>
          <tbody>
            {paginatedBorrowers.map((borrower) => {
              const isDeleting = deleteBorrowerMutation.isPending && deleteBorrowerMutation.variables?.id === borrower.id;

              return (
                <tr key={borrower.id}>
                  <DataTableCell className="text-left">
                    <div className="flex min-w-0 items-center justify-start gap-3">
                      <BorrowerAvatar className="h-8 w-8 shrink-0 text-[10px]" image={borrower.image} name={borrower.name} />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">{borrower.name || "Unnamed borrower"}</div>
                        <div className="truncate text-muted-foreground">{borrower.schoolId}</div>
                      </div>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="capitalize">{borrower.type}</DataTableCell>
                  <DataTableCell className="hidden md:table-cell">{borrower.program || "N/A"}</DataTableCell>
                  <DataTableCell className="hidden md:table-cell">{borrower.yearLevel ?? "N/A"}</DataTableCell>
                  <DataTableCell className="hidden md:table-cell">{borrower.section || "N/A"}</DataTableCell>
                  <DataTableCell className="hidden lg:table-cell">{borrower.contactNumber || "N/A"}</DataTableCell>
                  <DataTableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => onEdit?.(borrower)}
                        aria-label={`Edit ${borrower.name}`}
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isDeleting}
                        onClick={() => void handleDelete(borrower)}
                        aria-label={`Delete ${borrower.name}`}
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

      <TablePagination
        currentPage={visiblePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
