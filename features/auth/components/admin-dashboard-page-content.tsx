"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Route } from "next";
import Link from "next/link";
import { EyeIcon, SearchIcon, XIcon } from "lucide-react";

import { appDb } from "@/core/db/app-db";
import type { DateRangeValue } from "@/core/lib/date-range";
import { isDateWithinRange } from "@/core/lib/date-range";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { DateRangeFilter } from "@/core/ui/date-range-filter";
import { DataTable, DataTableCell, DataTableHeaderCell, DataTableSurface } from "@/core/ui/data-table";
import { Input } from "@/core/ui/input";
import { formatRecordedAt } from "@/features/borrow/lib/borrow-formatters";
import { listToolkeeperSessions } from "@/features/auth/lib/auth-repository";

export function AdminDashboardPageContent() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [searchQuery, setSearchQuery] = useState("");
  const sessions = useLiveQuery(() => listToolkeeperSessions(), [], []);
  const transactions = useLiveQuery(() => appDb.transactions.toArray(), [], []);
  const filteredSessions = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return sessions
      .filter((session) => isDateWithinRange(session.loginAt, dateRange))
      .filter((session) => {
        if (!normalizedSearchQuery) {
          return true;
        }

        return (
          session.name.toLowerCase().includes(normalizedSearchQuery) ||
          session.studentId.toLowerCase().includes(normalizedSearchQuery) ||
          session.yearLevel.toLowerCase().includes(normalizedSearchQuery) ||
          session.section.toLowerCase().includes(normalizedSearchQuery)
        );
      });
  }, [dateRange, searchQuery, sessions]);
  const borrowedCountsBySessionId = useMemo(() => {
    const counts = new Map<number, number>();

    for (const session of sessions) {
      counts.set(
        session.id,
        transactions.filter(
          (transaction) =>
            transaction.transactionType === "borrowed" &&
            transaction.recordedAt >= session.loginAt &&
            (!session.logoutAt || transaction.recordedAt <= session.logoutAt),
        ).length,
      );
    }

    return counts;
  }, [sessions, transactions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-normal text-muted-foreground">
              Toolkeeper Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.03em]">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium tracking-normal text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-[-0.03em]">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:min-w-[280px] lg:flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, student ID, year level, or section..."
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
            title="Session Date"
            value={dateRange}
            onChange={setDateRange}
            className="w-full lg:max-w-[440px]"
            boxed={false}
            showTitle={false}
          />
        </div>
      </div>

      <DataTableSurface>
        <DataTable className="min-w-[920px]">
          <thead>
            <tr>
              <DataTableHeaderCell>Session</DataTableHeaderCell>
              <DataTableHeaderCell>Student ID</DataTableHeaderCell>
              <DataTableHeaderCell>Year</DataTableHeaderCell>
              <DataTableHeaderCell>Section</DataTableHeaderCell>
              <DataTableHeaderCell>Login</DataTableHeaderCell>
              <DataTableHeaderCell>Logout</DataTableHeaderCell>
              <DataTableHeaderCell>Transactions</DataTableHeaderCell>
              <DataTableHeaderCell>Actions</DataTableHeaderCell>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr key={session.id}>
                <DataTableCell className="font-medium text-foreground">
                  {session.name}
                </DataTableCell>
                <DataTableCell>{session.studentId}</DataTableCell>
                <DataTableCell>{session.yearLevel}</DataTableCell>
                <DataTableCell>{session.section}</DataTableCell>
                <DataTableCell>{formatRecordedAt(session.loginAt)}</DataTableCell>
                <DataTableCell>{session.logoutAt ? formatRecordedAt(session.logoutAt) : "Active"}</DataTableCell>
                <DataTableCell>{borrowedCountsBySessionId.get(session.id) ?? 0}</DataTableCell>
                <DataTableCell>
                  <Button asChild variant="ghost" size="icon" aria-label={`View ${session.name} transactions`}>
                    <Link href={`/admin/sessions/${session.id}` as Route}>
                      <EyeIcon />
                    </Link>
                  </Button>
                </DataTableCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </DataTableSurface>

      {!filteredSessions.length ? (
        <div className="rounded-[calc(var(--radius-xl)+2px)] border border-dashed border-border/80 bg-card/60 p-10 text-center text-sm text-muted-foreground">
          No sessions match the selected filters.
        </div>
      ) : null}
    </div>
  );
}
