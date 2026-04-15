import { appDb } from "@/core/db/app-db";
import { hasTrashRetentionExpired } from "@/features/trash/lib/trash-retention";

export async function purgeExpiredTrashedTools() {
  const expiredToolIds = (await appDb.tools.toArray())
    .filter((tool) => hasTrashRetentionExpired(tool.deletedAt))
    .map((tool) => tool.id);

  if (!expiredToolIds.length) {
    return;
  }

  await appDb.tools.bulkDelete(expiredToolIds);
}

export async function purgeExpiredTrashedBorrowers() {
  const expiredBorrowerIds = (await appDb.borrowers.toArray())
    .filter((borrower) => hasTrashRetentionExpired(borrower.deletedAt))
    .map((borrower) => borrower.id);

  if (!expiredBorrowerIds.length) {
    return;
  }

  await appDb.borrowers.bulkDelete(expiredBorrowerIds);
}

export async function purgeExpiredTrashRecords() {
  await Promise.all([purgeExpiredTrashedTools(), purgeExpiredTrashedBorrowers()]);
}
