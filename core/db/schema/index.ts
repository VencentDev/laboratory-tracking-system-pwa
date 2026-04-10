import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const toolStatusEnum = pgEnum("tool_status", [
  "available",
  "borrowed",
  "missing",
]);

export const transactionTypeEnum = pgEnum("tool_transaction_type", [
  "borrowed",
  "returned",
  "correction",
]);

export const borrowerTypeEnum = pgEnum("borrower_type", [
  "student",
  "instructor",
  "staff",
]);

export const borrowers = pgTable(
  "borrowers",
  {
    id: text("id").primaryKey(),
    schoolId: text("school_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").unique(),
    image: text("image"),
    type: borrowerTypeEnum("type").notNull().default("student"),
    program: text("program"),
    yearLevel: integer("year_level"),
    section: text("section"),
    contactNumber: text("contact_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    schoolIdIdx: index("borrowers_school_id_idx").on(table.schoolId),
    typeIdx: index("borrowers_type_idx").on(table.type),
  }),
);

export const tools = pgTable(
  "tools",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    barcode: text("barcode").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    currentStatus: toolStatusEnum("current_status").notNull().default("available"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    barcodeIdx: index("tools_barcode_idx").on(table.barcode),
    statusIdx: index("tools_current_status_idx").on(table.currentStatus),
  }),
);

export const toolTransactions = pgTable(
  "tool_transactions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    toolId: integer("tool_id")
      .notNull()
      .references(() => tools.id, { onDelete: "cascade" }),
    borrowerId: text("borrower_id").references(() => borrowers.id, {
      onDelete: "set null",
    }),
    borrowerName: text("borrower_name").notNull(),
    transactionType: transactionTypeEnum("transaction_type").notNull(),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
    notes: text("notes"),
  },
  (table) => ({
    toolIdx: index("tool_transactions_tool_id_idx").on(table.toolId),
    borrowerIdx: index("tool_transactions_borrower_id_idx").on(table.borrowerId),
    recordedAtIdx: index("tool_transactions_recorded_at_idx").on(table.recordedAt),
    borrowerNameIdx: index("tool_transactions_borrower_name_idx").on(table.borrowerName),
  }),
);

export const borrowersRelations = relations(borrowers, ({ many }) => ({
  transactions: many(toolTransactions),
}));

export const toolsRelations = relations(tools, ({ many }) => ({
  transactions: many(toolTransactions),
}));

export const toolTransactionsRelations = relations(toolTransactions, ({ one }) => ({
  tool: one(tools, {
    fields: [toolTransactions.toolId],
    references: [tools.id],
  }),
  borrower: one(borrowers, {
    fields: [toolTransactions.borrowerId],
    references: [borrowers.id],
  }),
}));

export type BorrowerRecord = typeof borrowers.$inferSelect;
export type NewBorrowerRecord = typeof borrowers.$inferInsert;
export type ToolRecord = typeof tools.$inferSelect;
export type NewToolRecord = typeof tools.$inferInsert;
export type ToolTransactionRecord = typeof toolTransactions.$inferSelect;
export type NewToolTransactionRecord = typeof toolTransactions.$inferInsert;
