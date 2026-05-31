import { appDb } from "@/core/db/app-db";
import type {
  BorrowerRecord,
  ToolkeeperSessionRecord,
  ToolRecord,
  ToolTransactionRecord,
} from "@/core/db/schema";
import type { DateRangeValue } from "@/core/lib/date-range";
import { isDateWithinRange, normalizeDateRange } from "@/core/lib/date-range";
import type { AcknowledgementReportGroup, AcknowledgementReportItem } from "@/features/reports/types";

type BorrowedTransaction = ToolTransactionRecord & {
  transactionType: "borrowed";
};

export function getCurrentMonthDateRange(): Required<DateRangeValue> {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return { from, to };
}

export async function listAcknowledgementReportGroups(
  dateRange: DateRangeValue,
): Promise<AcknowledgementReportGroup[]> {
  const normalizedDateRange = withDefaultDateRange(dateRange);
  const transactions = await appDb.transactions
    .where("transactionType")
    .equals("borrowed")
    .toArray();
  const borrowedTransactions = transactions
    .filter((transaction): transaction is BorrowedTransaction => transaction.transactionType === "borrowed")
    .filter((transaction) => isDateWithinRange(transaction.recordedAt, normalizedDateRange));
  const borrowers = await appDb.borrowers.toArray();
  const tools = await appDb.tools.toArray();
  const toolkeeperSessions = await appDb.toolkeeperSessions.toArray();
  const borrowerById = new Map(borrowers.map((borrower) => [borrower.id, borrower]));
  const borrowerBySchoolId = new Map(
    borrowers
      .filter((borrower) => borrower.schoolId.trim())
      .map((borrower) => [borrower.schoolId, borrower] as const),
  );
  const toolById = new Map(tools.map((tool) => [tool.id, tool]));
  const groupedTransactions = groupTransactionsByBorrower(borrowedTransactions);
  const { from, to } = normalizedDateRange;

  return Array.from(groupedTransactions.entries())
    .map(([groupKey, groupTransactions]) => {
      const firstTransaction = groupTransactions[0];
      const borrower = findBorrower(firstTransaction, borrowerById, borrowerBySchoolId);
      const borrowerName = borrower?.name ?? firstTransaction.borrowerName;
      const borrowerSchoolId = borrower?.schoolId ?? firstTransaction.borrowerSchoolId;
      const borrowerId = borrower?.id ?? firstTransaction.borrowerId;
      const items = groupTransactions
        .map((transaction) =>
          toReportItem(
            transaction,
            toolById.get(transaction.toolId),
            findIssuerSession(transaction.recordedAt, toolkeeperSessions),
          ),
        )
        .sort((left, right) => left.borrowedAt.getTime() - right.borrowedAt.getTime() || left.toolName.localeCompare(right.toolName));
      const issuedByNames = Array.from(
        new Set(items.map((item) => item.issuedByName).filter((name): name is string => Boolean(name))),
      ).sort((left, right) => left.localeCompare(right));

      return {
        id: groupKey,
        slipNumber: createAcknowledgementSlipNumber({
          borrowerId,
          borrowerSchoolId,
          borrowerName,
          from,
          to,
        }),
        borrowerId,
        borrowerSchoolId,
        borrowerName,
        borrowerType: borrower?.type ?? null,
        borrowerProgram: borrower?.program ?? null,
        borrowerYearLevel: borrower?.yearLevel ?? null,
        borrowerSection: borrower?.section ?? null,
        issuedByNames,
        dateFrom: from,
        dateTo: to,
        items,
      };
    })
    .sort((left, right) => left.borrowerName.localeCompare(right.borrowerName));
}

function withDefaultDateRange(dateRange: DateRangeValue): Required<DateRangeValue> {
  const currentMonth = getCurrentMonthDateRange();
  const { from, to } = normalizeDateRange(dateRange);

  if (!from && !to) {
    return currentMonth;
  }

  return {
    from: from ?? to ?? currentMonth.from,
    to: to ?? from ?? currentMonth.to,
  };
}

function groupTransactionsByBorrower(transactions: BorrowedTransaction[]) {
  const groups = new Map<string, BorrowedTransaction[]>();

  for (const transaction of transactions) {
    const groupKey = createBorrowerGroupKey(transaction);
    const currentTransactions = groups.get(groupKey) ?? [];

    currentTransactions.push(transaction);
    groups.set(groupKey, currentTransactions);
  }

  return groups;
}

function createBorrowerGroupKey(transaction: ToolTransactionRecord) {
  if (transaction.borrowerId?.trim()) {
    return `id:${transaction.borrowerId}`;
  }

  if (transaction.borrowerSchoolId?.trim()) {
    return `school:${transaction.borrowerSchoolId}`;
  }

  return `name:${transaction.borrowerName.trim().toLowerCase()}`;
}

function findBorrower(
  transaction: ToolTransactionRecord,
  borrowerById: Map<string, BorrowerRecord>,
  borrowerBySchoolId: Map<string, BorrowerRecord>,
) {
  if (transaction.borrowerId) {
    const borrower = borrowerById.get(transaction.borrowerId);

    if (borrower) {
      return borrower;
    }
  }

  if (transaction.borrowerSchoolId) {
    return borrowerBySchoolId.get(transaction.borrowerSchoolId) ?? null;
  }

  return null;
}

function toReportItem(
  transaction: ToolTransactionRecord,
  tool: ToolRecord | undefined,
  issuerSession: ToolkeeperSessionRecord | null,
): AcknowledgementReportItem {
  return {
    transactionId: transaction.id,
    toolId: transaction.toolId,
    toolName: transaction.toolName,
    barcode: transaction.barcode,
    category: tool?.category ?? null,
    borrowedAt: transaction.recordedAt,
    issuedByName: issuerSession?.name ?? null,
    issuedByDetails: issuerSession
      ? [issuerSession.studentId, issuerSession.yearLevel, `Section ${issuerSession.section}`].join(" / ")
      : null,
  };
}

function findIssuerSession(recordedAt: Date, sessions: ToolkeeperSessionRecord[]) {
  const recordedAtTime = recordedAt.getTime();

  return (
    sessions
      .filter((session) => {
        const loginTime = session.loginAt.getTime();
        const logoutTime = session.logoutAt?.getTime() ?? Number.POSITIVE_INFINITY;

        return loginTime <= recordedAtTime && recordedAtTime <= logoutTime;
      })
      .sort((left, right) => right.loginAt.getTime() - left.loginAt.getTime())
      .at(0) ?? null
  );
}

function createAcknowledgementSlipNumber({
  borrowerId,
  borrowerSchoolId,
  borrowerName,
  from,
  to,
}: {
  borrowerId: string | null;
  borrowerSchoolId: string | null;
  borrowerName: string;
  from: Date;
  to: Date;
}) {
  const rangeKey = isSameMonth(from, to)
    ? `${from.getFullYear()}${String(from.getMonth() + 1).padStart(2, "0")}`
    : `${formatCompactDate(from)}-${formatCompactDate(to)}`;
  const borrowerKey = (borrowerSchoolId || borrowerId || borrowerName || "NA")
    .replace(/[^a-z0-9]/gi, "")
    .slice(-8)
    .toUpperCase();

  return `ACK-${rangeKey}-${borrowerKey || "NA"}`;
}

function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function formatCompactDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}
