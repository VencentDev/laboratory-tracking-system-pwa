import Dexie, { type EntityTable, type Transaction } from "dexie";

import type {
  AdminCredentialRecord,
  AppSettingRecord,
  BorrowerRecord,
  ToolkeeperSessionRecord,
  ToolRecord,
  ToolTransactionRecord,
} from "@/core/db/schema";
import { APP_DB_NAME, APP_DB_VERSION } from "@/core/db/schema";

type SchemaVersionDefinition = {
  version: number;
  stores: Record<string, string>;
  upgrade?: (transaction: Transaction) => Promise<void> | void;
};

async function hashPassword(password: string) {
  const encodedPassword = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedPassword);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const schemaVersions: SchemaVersionDefinition[] = [
  {
    version: 1,
    stores: {
      tools: "++id, &barcode, currentStatus, category, createdAt, updatedAt",
      borrowers: "&id, &schoolId, type, createdAt",
      transactions:
        "++id, toolId, barcode, borrowerId, borrowerName, transactionType, recordedAt, [toolId+transactionType]",
      appSettings: "&key, updatedAt",
    },
  },
  {
    version: 2,
    stores: {
      tools: "++id, &barcode, currentStatus, category, createdAt, updatedAt, deletedAt",
      borrowers: "&id, &schoolId, type, createdAt, deletedAt",
      transactions:
        "++id, toolId, barcode, borrowerId, borrowerName, transactionType, recordedAt, [toolId+transactionType]",
      appSettings: "&key, updatedAt",
    },
    upgrade: async (transaction) => {
      await transaction
        .table("tools")
        .toCollection()
        .modify((tool: ToolRecord & { deletedAt?: Date | null }) => {
          tool.deletedAt ??= null;
        });

      await transaction
        .table("borrowers")
        .toCollection()
        .modify((borrower: BorrowerRecord & { deletedAt?: Date | null }) => {
          borrower.deletedAt ??= null;
        });
    },
  },
  {
    version: 3,
    stores: {
      tools: "++id, &barcode, currentStatus, category, createdAt, updatedAt, deletedAt",
      borrowers: "&id, &schoolId, type, createdAt, deletedAt",
      transactions:
        "++id, toolId, barcode, borrowerId, borrowerSchoolId, borrowerName, transactionType, recordedAt, [toolId+transactionType]",
      appSettings: "&key, updatedAt",
    },
    upgrade: async (transaction) => {
      const borrowers = await transaction.table("borrowers").toArray() as BorrowerRecord[];
      const borrowerSchoolIdsById = new Map(
        borrowers.map((borrower) => [borrower.id, borrower.schoolId] as const),
      );

      await transaction
        .table("transactions")
        .toCollection()
        .modify(
          (
            transactionRecord: ToolTransactionRecord & {
              borrowerSchoolId?: string | null;
            },
          ) => {
            transactionRecord.borrowerSchoolId ??=
              transactionRecord.borrowerId
                ? borrowerSchoolIdsById.get(transactionRecord.borrowerId) ?? null
                : null;
          },
        );
    },
  },
  {
    version: 4,
    stores: {
      tools: "++id, &barcode, currentStatus, category, createdAt, updatedAt, deletedAt",
      borrowers: "&id, &schoolId, type, createdAt, deletedAt",
      transactions:
        "++id, toolId, barcode, borrowerId, borrowerSchoolId, borrowerName, transactionType, recordedAt, [toolId+transactionType]",
      appSettings: "&key, updatedAt",
      adminCredentials: "&id, updatedAt",
      toolkeeperSessions: "++id, studentId, loginAt, logoutAt",
    },
    upgrade: async (transaction) => {
      await transaction.table("adminCredentials").put({
        id: "admin",
        username: "admin",
        passwordHash: await hashPassword("admin123"),
        updatedAt: new Date(),
      } satisfies AdminCredentialRecord);
    },
  },
];

export class AppDatabase extends Dexie {
  tools!: EntityTable<ToolRecord, "id">;
  borrowers!: EntityTable<BorrowerRecord, "id">;
  transactions!: EntityTable<ToolTransactionRecord, "id">;
  appSettings!: EntityTable<AppSettingRecord, "key">;
  adminCredentials!: EntityTable<AdminCredentialRecord, "id">;
  toolkeeperSessions!: EntityTable<ToolkeeperSessionRecord, "id">;

  constructor() {
    super(APP_DB_NAME);

    for (const schemaVersion of schemaVersions) {
      const version = this.version(schemaVersion.version).stores(schemaVersion.stores);

      if (schemaVersion.upgrade) {
        version.upgrade(schemaVersion.upgrade);
      }
    }

    if (schemaVersions.at(-1)?.version !== APP_DB_VERSION) {
      throw new Error("IndexedDB version constant is out of sync with the schema history.");
    }
  }
}

export const appDb = new AppDatabase();
