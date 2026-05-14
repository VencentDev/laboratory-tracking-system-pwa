"use client";

import { useLiveQuery } from "dexie-react-hooks";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { formatRecordedAt, formatTransactionType } from "@/features/borrow/lib/borrow-formatters";
import { getSessionWithTransactions } from "@/features/auth/lib/auth-repository";

export function AdminSessionDetailPageContent() {
  const params = useParams<{ sessionId: string }>();
  const { sessionId } = params;
  const numericSessionId = Number(sessionId);
  const sessionDetail = useLiveQuery(
    () =>
      Number.isFinite(numericSessionId)
        ? getSessionWithTransactions(numericSessionId)
        : Promise.resolve(null),
    [numericSessionId],
    undefined,
  );

  if (sessionDetail === undefined) {
    return null;
  }

  if (!sessionDetail) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href={"/admin" as Route}>
            <ArrowLeftIcon />
            Back to dashboard
          </Link>
        </Button>
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          Session not found.
        </div>
      </div>
    );
  }

  const { session, transactions } = sessionDetail;
  const borrowedCount = transactions.filter((transaction) => transaction.transactionType === "borrowed").length;
  const returnedCount = transactions.filter((transaction) => transaction.transactionType === "returned").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-[-0.03em]">{session.name}</h1>
          <p className="text-sm text-muted-foreground">
            {session.studentId} - Year {session.yearLevel} - Section {session.section}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={"/admin" as Route}>
            <ArrowLeftIcon />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-normal text-muted-foreground">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-foreground">{formatRecordedAt(session.loginAt)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-normal text-muted-foreground">Logout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-foreground">
              {session.logoutAt ? formatRecordedAt(session.logoutAt) : "Active"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-normal text-muted-foreground">Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.03em]">{borrowedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-normal text-muted-foreground">Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.03em]">{returnedCount}</div>
          </CardContent>
        </Card>
      </div>

      {transactions.length ? (
        <DataTableSurface>
          <DataTable className="min-w-[860px]">
            <thead>
              <tr>
                <DataTableHeaderCell>Barcode</DataTableHeaderCell>
                <DataTableHeaderCell>Tool</DataTableHeaderCell>
                <DataTableHeaderCell>Action</DataTableHeaderCell>
                <DataTableHeaderCell>Borrower</DataTableHeaderCell>
                <DataTableHeaderCell>Date</DataTableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <DataTableCell className="font-mono">{transaction.barcode}</DataTableCell>
                  <DataTableCell className="font-medium text-foreground">{transaction.toolName}</DataTableCell>
                  <DataTableCell>{formatTransactionType(transaction.transactionType)}</DataTableCell>
                  <DataTableCell>
                    <div className="min-w-0">
                      <div className="truncate text-foreground">{transaction.borrowerName}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {transaction.borrowerSchoolId ?? "No school ID"}
                      </div>
                    </div>
                  </DataTableCell>
                  <DataTableCell>{formatRecordedAt(transaction.recordedAt)}</DataTableCell>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableSurface>
      ) : (
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No transactions were recorded during this session.
        </div>
      )}
    </div>
  );
}
