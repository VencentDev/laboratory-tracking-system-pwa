"use client";

import { useState } from "react";
import { SearchIcon, SquareUserRoundIcon, X } from "lucide-react";

import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { PageHeader } from "@/core/ui/page-header";
import { BorrowerForm } from "@/features/borrowers/components/borrower-form";
import { BorrowerList } from "@/features/borrowers/components/borrower-list";
import type { BorrowerProfile } from "@/features/borrowers/types";

export function RegisterBorrowerPageContent() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<BorrowerProfile | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "student" | "instructor" | "staff">("all");

  function openCreateBorrowerDialog() {
    setSelectedBorrower(undefined);
    setIsFormOpen(true);
  }

  function openEditBorrowerDialog(borrower: BorrowerProfile) {
    setSelectedBorrower(borrower);
    setIsFormOpen(true);
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Borrowers"
        title="Manage Borrowers"
        description="Create and maintain borrower records with the identity details needed for accountability and reporting."
        actions={
          <Button type="button" className="gap-2 px-5" onClick={openCreateBorrowerDialog}>
            <SquareUserRoundIcon className="h-4 w-4" />
            Record Borrower
          </Button>
        }
      />

      {/* --- Filter Section --- */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search Bar */}
          <div className="relative w-full flex-1 sm:min-w-[250px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, school ID, or program..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-10 h-10 w-full bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex w-full flex-1 items-center gap-2 sm:min-w-[300px]">
            {(["all", "student", "instructor", "staff"] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={typeFilter === type ? "default" : "outline"}
                className={`flex-1 h-10 ${typeFilter !== type ? "bg-background" : ""}`}
                onClick={() => setTypeFilter(type)}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* --- End Filter Section --- */}

      <BorrowerList onEdit={openEditBorrowerDialog} searchQuery={searchQuery} typeFilter={typeFilter} />

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);

          if (!open) {
            setSelectedBorrower(undefined);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBorrower ? "Edit Borrower" : "Record Borrower"}
            </DialogTitle>
            <DialogDescription>
              {selectedBorrower
                ? "Update the digital borrower record while preserving the existing identity entry."
                : "Capture the borrower details in a simple form that matches current laboratory routines."}
            </DialogDescription>
          </DialogHeader>
          <BorrowerForm key={selectedBorrower?.id ?? "create"} borrower={selectedBorrower} />
        </DialogContent>
      </Dialog>
    </div>
  );
}