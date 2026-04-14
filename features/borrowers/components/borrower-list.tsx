"use client";

import { useEffect, useMemo, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { DestructiveConfirmDialog } from "@/core/components/destructive-confirm-dialog";
import { Button } from "@/core/ui/button";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { TablePagination } from "@/core/ui/table-pagination";
import { BorrowerAvatar } from "@/features/borrowers/components/borrower-avatar";
import { useBorrowers } from "@/features/borrowers/hooks/use-borrower";
import { deleteBorrower } from "@/features/borrowers/lib/borrower-repository";
import type { BorrowerProfile } from "@/features/borrowers/types";

type BorrowerListProps = {
  onEdit?: (borrower: BorrowerProfile) => void;
  searchQuery?: string;
  typeFilter?: string;
};

const PAGE_SIZE = 10;

export function BorrowerList({ onEdit, searchQuery = "", typeFilter = "all" }: BorrowerListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [borrowerPendingDelete, setBorrowerPendingDelete] = useState<BorrowerProfile | null>(null);
  const [deletingBorrowerId, setDeletingBorrowerId] = useState<string | null>(null);
  const { data: borrowers, isLoading } = useBorrowers();

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

  async function handleDelete() {
    if (!borrowerPendingDelete) {
      return;
    }

    setDeletingBorrowerId(borrowerPendingDelete.id);

    try {
      const deletedBorrower = await deleteBorrower(borrowerPendingDelete.id);

      if (!deletedBorrower) {
        toast.error("The borrower could not be moved to trash. Try again once local storage is available.");
        return;
      }

      toast.success(`${deletedBorrower.name} was moved to trash.`);
      setBorrowerPendingDelete(null);
    } catch {
      toast.error("The borrower could not be moved to trash. Try again once local storage is available.");
    } finally {
      setDeletingBorrowerId(null);
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
              const isDeleting = deletingBorrowerId === borrower.id;

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
                        onClick={() => setBorrowerPendingDelete(borrower)}
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

      <DestructiveConfirmDialog
        open={Boolean(borrowerPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setBorrowerPendingDelete(null);
          }
        }}
        title="Move this borrower to trash?"
        description={
          borrowerPendingDelete
            ? `${borrowerPendingDelete.name} (${borrowerPendingDelete.schoolId}) will be hidden from the borrower registry until you restore the record from Trash.`
            : "This borrower will be moved to trash until you restore the record."
        }
        confirmLabel="Move to trash"
        isPending={deletingBorrowerId === borrowerPendingDelete?.id}
        onConfirm={handleDelete}
      />
    </div>
  );
}
