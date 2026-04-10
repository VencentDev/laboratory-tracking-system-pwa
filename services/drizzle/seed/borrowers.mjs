import { db } from "../db.mjs";
import { borrowers } from "../schema/index.mjs";
import {
  BORROWER_TYPES,
  FIRST_NAMES,
  LAST_NAMES,
  PROGRAMS,
  SECTIONS,
} from "./config.mjs";
import { daysAgo, padNumber, toIsoDateSegment } from "../utils.mjs";

export async function createBorrowers(count, label) {
  if (count <= 0) {
    return [];
  }

  const batchPrefix = `${label}-${toIsoDateSegment()}-${Date.now()}`;
  const borrowerValues = Array.from({ length: count }, (_, index) => {
    const sequence = index + 1;
    const uniqueSuffix = `${batchPrefix}-${padNumber(sequence)}-${crypto.randomUUID().slice(0, 8)}`;

    return {
      id: `seed-borrower-${uniqueSuffix}`,
      schoolId: `SEED-${toIsoDateSegment().slice(2)}-${padNumber(sequence, 5)}-${Date.now().toString().slice(-4)}`,
      name: `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[index % LAST_NAMES.length]}`,
      email: `seed.borrower.${uniqueSuffix}@example.com`,
      image: null,
      type: BORROWER_TYPES[index % BORROWER_TYPES.length],
      program: PROGRAMS[index % PROGRAMS.length],
      yearLevel: (index % 4) + 1,
      section: SECTIONS[index % SECTIONS.length],
      contactNumber: `09${String(100000000 + index).slice(-9)}`,
      createdAt: daysAgo(120 - index * 2, 8 + (index % 6)),
    };
  });

  return db.insert(borrowers).values(borrowerValues).returning();
}
