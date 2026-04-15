export const TRASH_RETENTION_DAYS = 30;

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const TRASH_RETENTION_WINDOW_MS = TRASH_RETENTION_DAYS * DAY_IN_MS;

export function getTrashExpirationDate(deletedAt: Date | null) {
  if (!deletedAt) {
    return null;
  }

  return new Date(deletedAt.getTime() + TRASH_RETENTION_WINDOW_MS);
}

export function hasTrashRetentionExpired(deletedAt: Date | null, now: Date = new Date()) {
  const expirationDate = getTrashExpirationDate(deletedAt);

  return Boolean(expirationDate && expirationDate.getTime() <= now.getTime());
}
