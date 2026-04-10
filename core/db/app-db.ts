import Dexie, { type EntityTable } from "dexie";

import type {
  AppSettingRecord,
  BorrowerRecord,
  ToolRecord,
  ToolTransactionRecord,
} from "@/core/db/schema";
import { APP_DB_NAME, APP_DB_VERSION } from "@/core/db/schema";

type SchemaVersionDefinition = {
  version: number;
  stores: Record<string, string>;
};

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
];

export class AppDatabase extends Dexie {
  tools!: EntityTable<ToolRecord, "id">;
  borrowers!: EntityTable<BorrowerRecord, "id">;
  transactions!: EntityTable<ToolTransactionRecord, "id">;
  appSettings!: EntityTable<AppSettingRecord, "key">;

  constructor() {
    super(APP_DB_NAME);

    for (const schemaVersion of schemaVersions) {
      this.version(schemaVersion.version).stores(schemaVersion.stores);
    }

    if (schemaVersions.at(-1)?.version !== APP_DB_VERSION) {
      throw new Error("IndexedDB version constant is out of sync with the schema history.");
    }
  }
}

export const appDb = new AppDatabase();
