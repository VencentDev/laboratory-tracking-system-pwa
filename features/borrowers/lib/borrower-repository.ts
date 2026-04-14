import { appDb } from "@/core/db/app-db";
import type { BorrowerProfile } from "@/features/borrowers/types";
import type { BorrowerInput } from "@/features/borrowers/lib/validations";

function normalizeOptionalText(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function isActiveBorrower(borrower: BorrowerProfile | undefined | null): borrower is BorrowerProfile {
  return Boolean(borrower && !borrower.deletedAt);
}

function normalizeYearLevel(value?: string) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

async function schoolIdBelongsToAnotherBorrower(schoolId: string, borrowerId?: string) {
  const existingBorrower = await appDb.borrowers.where("schoolId").equals(schoolId).first();

  if (!existingBorrower) {
    return false;
  }

  return existingBorrower.id !== borrowerId;
}

export async function listBorrowers(): Promise<BorrowerProfile[]> {
  const borrowers = await appDb.borrowers.orderBy("createdAt").reverse().toArray();

  return borrowers.filter(isActiveBorrower);
}

export async function listDeletedBorrowers(): Promise<BorrowerProfile[]> {
  const borrowers = await appDb.borrowers.orderBy("deletedAt").reverse().toArray();

  return borrowers.filter((borrower): borrower is BorrowerProfile => Boolean(borrower.deletedAt));
}

export async function getBorrowerById(id: string) {
  const trimmedId = id.trim();

  if (!trimmedId) {
    return null;
  }

  const borrower = await appDb.borrowers.get(trimmedId);

  return isActiveBorrower(borrower) ? borrower : null;
}

export async function getBorrowerBySchoolId(schoolId: string) {
  const trimmedSchoolId = schoolId.trim();

  if (!trimmedSchoolId) {
    return null;
  }

  const borrower = await appDb.borrowers.where("schoolId").equals(trimmedSchoolId).first();

  return isActiveBorrower(borrower) ? borrower : null;
}

export async function createBorrower(data: BorrowerInput) {
  try {
    const schoolId = data.schoolId.trim();

    if (await schoolIdBelongsToAnotherBorrower(schoolId)) {
      return null;
    }

    const borrower: BorrowerProfile = {
      id: crypto.randomUUID(),
      schoolId,
      name: data.name.trim(),
      email: null,
      image: null,
      type: data.type,
      program: normalizeOptionalText(data.program),
      yearLevel: normalizeYearLevel(data.yearLevel),
      section: normalizeOptionalText(data.section),
      contactNumber: normalizeOptionalText(data.contactNumber),
      createdAt: new Date(),
      deletedAt: null,
    };

    await appDb.borrowers.add(borrower);

    return borrower;
  } catch {
    return null;
  }
}

export async function updateBorrower(id: string, data: BorrowerInput) {
  try {
    const existingBorrower = await appDb.borrowers.get(id);
    const schoolId = data.schoolId.trim();

    if (!isActiveBorrower(existingBorrower) || (await schoolIdBelongsToAnotherBorrower(schoolId, id))) {
      return null;
    }

    await appDb.borrowers.update(id, {
      schoolId,
      name: data.name.trim(),
      type: data.type,
      program: normalizeOptionalText(data.program),
      yearLevel: normalizeYearLevel(data.yearLevel),
      section: normalizeOptionalText(data.section),
      contactNumber: normalizeOptionalText(data.contactNumber),
    });

    return (await appDb.borrowers.get(id)) ?? null;
  } catch {
    return null;
  }
}

export async function deleteBorrower(id: string) {
  try {
    return await appDb.transaction("rw", appDb.borrowers, async () => {
      const existingBorrower = await appDb.borrowers.get(id);

      if (!isActiveBorrower(existingBorrower)) {
        return null;
      }

      await appDb.borrowers.update(id, {
        deletedAt: new Date(),
      });

      return existingBorrower;
    });
  } catch {
    return null;
  }
}

export async function restoreBorrower(id: string) {
  try {
    return await appDb.transaction("rw", appDb.borrowers, async () => {
      const existingBorrower = await appDb.borrowers.get(id);

      if (!existingBorrower?.deletedAt) {
        return null;
      }

      await appDb.borrowers.update(id, {
        deletedAt: null,
      });

      return (await appDb.borrowers.get(id)) ?? null;
    });
  } catch {
    return null;
  }
}
