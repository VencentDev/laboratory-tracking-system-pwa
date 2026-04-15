import { getTrashExpirationDate } from "@/features/trash/lib/trash-retention";

function formatTimestamp(value: Date | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatTrashTimestamp(value: Date | null) {
  return formatTimestamp(value);
}

export function formatTrashAutoDeleteLabel(value: Date | null) {
  const expirationDate = getTrashExpirationDate(value);

  if (!expirationDate) {
    return "Retention window unavailable";
  }

  return `Auto-deletes ${formatTimestamp(expirationDate)}`;
}
