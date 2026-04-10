"use client";

import { Button } from "@/core/ui/button";

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[calc(var(--radius-xl)+2px)] border border-border/70 bg-card/80 p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Previous
      </Button>
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;

        return (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Button>
      </div>
    </div>
  );
}
