"use client";

import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { BorrowerAvatar } from "@/features/borrowers/components/borrower-avatar";
import { restoreBorrower } from "@/features/borrowers/lib/borrower-repository";
import type { BorrowerProfile } from "@/features/borrowers/types";
import { formatTrashTimestamp } from "@/features/trash/lib/trash-formatters";

type TrashBorrowersTableProps = {
  borrowers?: BorrowerProfile[];
  isLoading: boolean;
};

export function TrashBorrowersTable({ borrowers, isLoading }: TrashBorrowersTableProps) {

  async function handleRestore(borrowerId: string, borrowerName: string) {
    const restoredBorrower = await restoreBorrower(borrowerId);

    if (!restoredBorrower) {
      toast.error("The borrower could not be restored from trash.");
      return;
    }

    toast.success(`${borrowerName} was restored to the borrower registry.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trashed Borrowers</CardTitle>
        <CardDescription>Restore deleted borrower records back to the active registry.</CardDescription>
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
            <DataTable className="min-w-[860px]">
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
                        <BorrowerAvatar className="h-8 w-8 shrink-0 text-[10px]" image={borrower.image} name={borrower.name} />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">{borrower.name}</div>
                          <div className="truncate text-muted-foreground">{borrower.schoolId}</div>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="capitalize">{borrower.type}</DataTableCell>
                    <DataTableCell>{borrower.program || "N/A"}</DataTableCell>
                    <DataTableCell>{borrower.contactNumber || "N/A"}</DataTableCell>
                    <DataTableCell>{formatTrashTimestamp(borrower.deletedAt)}</DataTableCell>
                    <DataTableCell className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => void handleRestore(borrower.id, borrower.name)}
                      >
                        <RotateCcwIcon className="h-4 w-4" />
                        Restore
                      </Button>
                    </DataTableCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </DataTableSurface>
        )}
      </CardContent>
    </Card>
  );
}
