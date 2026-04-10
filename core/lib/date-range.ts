export type DateRangeValue = {
  from?: Date;
  to?: Date;
};

export function hasDateRangeValue(value: DateRangeValue) {
  return Boolean(value.from || value.to);
}

export function normalizeDateRange(value: DateRangeValue) {
  const from = value.from ?? null;
  const to = value.to ?? null;

  if (from && to && from.getTime() > to.getTime()) {
    return { from: to, to: from };
  }

  return { from, to };
}

export function isDateWithinRange(date: Date | null | undefined, value: DateRangeValue) {
  if (!hasDateRangeValue(value)) {
    return true;
  }

  if (!date) {
    return false;
  }

  const { from, to } = normalizeDateRange(value);
  const timestamp = date.getTime();

  if (from && timestamp < from.getTime()) {
    return false;
  }

  if (to) {
    const inclusiveEnd = new Date(to);
    inclusiveEnd.setHours(23, 59, 59, 999);

    if (timestamp > inclusiveEnd.getTime()) {
      return false;
    }
  }

  return true;
}
