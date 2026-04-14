"use client";

import { useMemo, useState } from "react";
import { Trash2Icon } from "lucide-react";

import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { PageHeader } from "@/core/ui/page-header";
import { useDeletedBorrowers } from "@/features/borrowers/hooks/use-borrower";
import { useDeletedTools } from "@/features/inventory/hooks/use-tools";
import { TrashBorrowersTable } from "@/features/trash/components/trash-borrowers-table";
import { TrashToolsTable } from "@/features/trash/components/trash-tools-table";

export function TrashPageContent() {
  const { data: deletedTools, isLoading: isToolsLoading } = useDeletedTools();
  const { data: deletedBorrowers, isLoading: isBorrowersLoading } = useDeletedBorrowers();
  const [activeTab, setActiveTab] = useState<"tools" | "borrowers">("tools");
  const trashCount = (deletedTools?.length ?? 0) + (deletedBorrowers?.length ?? 0);
  const toolCount = deletedTools?.length ?? 0;
  const borrowerCount = deletedBorrowers?.length ?? 0;
  const tabs = useMemo(
    () => [
      { key: "tools" as const, label: "Tools", count: toolCount },
      { key: "borrowers" as const, label: "Borrowers", count: borrowerCount },
    ],
    [borrowerCount, toolCount],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recovery"
        title="Trash"
        description="Temporarily deleted tools and borrower records stay here until you restore them."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm text-muted-foreground">
            <Trash2Icon className="h-4 w-4" />
            {trashCount} item{trashCount === 1 ? "" : "s"} in trash
          </div>
        }
      />

      <div className="space-y-4">
        <div className="inline-flex w-full items-center gap-2 rounded-2xl border border-border/70 bg-card/50 p-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Button
                key={tab.key}
                type="button"
                variant="ghost"
                className={cn(
                  "relative flex-1 justify-center rounded-xl px-4 text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/92 hover:text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "absolute right-3 rounded-full px-2 py-0.5 text-xs",
                    isActive ? "bg-primary-foreground/15 text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {tab.count}
                </span>
              </Button>
            );
          })}
        </div>

        {activeTab === "tools" ? (
          <TrashToolsTable tools={deletedTools} isLoading={isToolsLoading} />
        ) : (
          <TrashBorrowersTable borrowers={deletedBorrowers} isLoading={isBorrowersLoading} />
        )}
      </div>
    </div>
  );
}
