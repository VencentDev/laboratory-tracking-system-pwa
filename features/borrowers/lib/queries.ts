import { desc, eq } from "drizzle-orm";

import { db } from "@/core/db";
import { borrowers } from "@/core/db/schema";
import type { BorrowerInput } from "@/features/borrowers/lib/validations";

function normalizeOptionalText(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function normalizeYearLevel(value?: string) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

export async function getAllBorrowers() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    return await db.select().from(borrowers).orderBy(desc(borrowers.createdAt));
  } catch {
    return [];
  }
}

export async function getBorrowerById(id: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [borrower] = await db.select().from(borrowers).where(eq(borrowers.id, id)).limit(1);

    return borrower ?? null;
  } catch {
    return null;
  }
}

export async function getBorrowerBySchoolId(schoolId: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [borrower] = await db.select().from(borrowers).where(eq(borrowers.schoolId, schoolId)).limit(1);

    return borrower ?? null;
  } catch {
    return null;
  }
}

export async function createBorrower(data: BorrowerInput) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [borrower] = await db
      .insert(borrowers)
      .values({
        id: crypto.randomUUID(),
        schoolId: data.schoolId.trim(),
        name: data.name.trim(),
        image: null,
        type: data.type,
        program: normalizeOptionalText(data.program),
        yearLevel: normalizeYearLevel(data.yearLevel),
        section: normalizeOptionalText(data.section),
        contactNumber: normalizeOptionalText(data.contactNumber),
      })
      .returning();

    return borrower ?? null;
  } catch {
    return null;
  }
}

export async function updateBorrower(id: string, data: BorrowerInput) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [borrower] = await db
      .update(borrowers)
      .set({
        schoolId: data.schoolId.trim(),
        name: data.name.trim(),
        type: data.type,
        program: normalizeOptionalText(data.program),
        yearLevel: normalizeYearLevel(data.yearLevel),
        section: normalizeOptionalText(data.section),
        contactNumber: normalizeOptionalText(data.contactNumber),
      })
      .where(eq(borrowers.id, id))
      .returning();

    return borrower ?? null;
  } catch {
    return null;
  }
}

export async function deleteBorrower(id: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const [borrower] = await db.delete(borrowers).where(eq(borrowers.id, id)).returning();

    return borrower ?? null;
  } catch {
    return null;
  }
}
