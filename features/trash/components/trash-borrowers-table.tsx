"use client";

import { useState } from "react";
import { RotateCcwIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { DestructiveConfirmDialog } from "@/core/components/destructive-confirm-dialog";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { BorrowerAvatar } from "@/features/borrowers/components/borrower-avatar";
import { permanentlyDeleteBorrower, restoreBorrower } from "@/features/borrowers/lib/borrower-repository";
import type { BorrowerProfile } from "@/features/borrowers/types";
import { formatTrashAutoDeleteLabel, formatTrashTimestamp } from "@/features/trash/lib/trash-formatters";
import { TRASH_RETENTION_DAYS } from "@/features/trash/lib/trash-retention";

type TrashBorrowersTableProps = {
  borrowers?: BorrowerProfile[];
  isLoading: boolean;
};

export function TrashBorrowersTable({ borrowers, isLoading }: TrashBorrowersTableProps) {
  const [restoringBorrowerId, setRestoringBorrowerId] = useState<string | null>(null);
  const [borrowerPendingPermanentDelete, setBorrowerPendingPermanentDelete] = useState<BorrowerProfile | null>(null);
  const [deletingBorrowerId, setDeletingBorrowerId] = useState<string | null>(null);

  async function handleRestore(borrowerId: string, borrowerName: string) {
    setRestoringBorrowerId(borrowerId);

    try {
      const restoredBorrower = await restoreBorrower(borrowerId);

      if (!restoredBorrower) {
        toast.error("The borrower could not be restored from trash.");
        return;
      }

      toast.success(`${borrowerName} was restored to the borrower registry.`);
    } catch {
      toast.error("The borrower could not be restored from trash.");
    } finally {
      setRestoringBorrowerId(null);
    }
  }

  async function handlePermanentDelete() {
    if (!borrowerPendingPermanentDelete) {
      return;
    }

    setDeletingBorrowerId(borrowerPendingPermanentDelete.id);

    try {
      const deletedBorrower = await permanentlyDeleteBorrower(borrowerPendingPermanentDelete.id);

      if (!deletedBorrower) {
        toast.error("The borrower could not be permanently deleted from trash.");
        return;
      }

      toast.success(`${deletedBorrower.name} was permanently deleted.`);
      setBorrowerPendingPermanentDelete(null);
    } catch {
      toast.error("The borrower could not be permanently deleted from trash.");
    } finally {
      setDeletingBorrowerId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trashed Borrowers</CardTitle>
        <CardDescription>
          Restore deleted borrower records back to the active registry or permanently remove them.
          Trash is cleared automatically after {TRASH_RETENTION_DAYS} days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading deleted borrowers...</p>
        ) : !borrowers?.length ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            No borrowers are in trash.
          </div>
        ) : (
          <DataTableSurface>
            <DataTable className="min-w-[960px]">
              <thead>
                <tr>
                  <DataTableHeaderCell className="text-left">Borrower</DataTableHeaderCell>
                  <DataTableHeaderCell>Type</DataTableHeaderCell>
                  <DataTableHeaderCell>Program</DataTableHeaderCell>
                  <DataTableHeaderCell>Contact</DataTableHeaderCell>
                  <DataTableHeaderCell>Deleted</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-center">Action</DataTableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {borrowers.map((borrower) => (
                  <tr key={borrower.id}>
                    <DataTableCell className="text-left">
                      <div className="flex min-w-0 items-center gap-3">
                        <BorrowerAvatar
                          className="h-8 w-8 shrink-0 text-[10px]"
                          image={borrower.image}
                          name={borrower.name}
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">{borrower.name}</div>
                          <div className="truncate text-muted-foreground">{borrower.schoolId}</div>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="capitalize">{borrower.type}</DataTableCell>
                    <DataTableCell>{borrower.program || "N/A"}</DataTableCell>
                    <DataTableCell>{borrower.contactNumber || "N/A"}</DataTableCell>
                    <DataTableCell>
                      <div className="space-y-1">
                        <div>{formatTrashTimestamp(borrower.deletedAt)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTrashAutoDeleteLabel(borrower.deletedAt)}
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={restoringBorrowerId === borrower.id || deletingBorrowerId === borrower.id}
                          onClick={() => void handleRestore(borrower.id, borrower.name)}
                        >
                          <RotateCcwIcon className="h-4 w-4" />
                          {restoringBorrowerId === borrower.id ? "Restoring..." : "Restore"}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          disabled={restoringBorrowerId === borrower.id || deletingBorrowerId === borrower.id}
                          onClick={() => setBorrowerPendingPermanentDelete(borrower)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </DataTableCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </DataTableSurface>
        )}
      </CardContent>

      <DestructiveConfirmDialog
        open={Boolean(borrowerPendingPermanentDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setBorrowerPendingPermanentDelete(null);
          }
        }}
        title="Delete this borrower permanently?"
        description={
          borrowerPendingPermanentDelete
            ? `${borrowerPendingPermanentDelete.name} (${borrowerPendingPermanentDelete.schoolId}) will be removed from Trash immediately. This cannot be undone.`
            : "This borrower will be removed from Trash immediately. This cannot be undone."
        }
        confirmLabel="Delete permanently"
        isPending={deletingBorrowerId === borrowerPendingPermanentDelete?.id}
        onConfirm={handlePermanentDelete}
      />
    </Card>
  );
}
