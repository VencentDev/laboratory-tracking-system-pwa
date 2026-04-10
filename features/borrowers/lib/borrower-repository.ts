import { appDb } from "@/core/db/app-db";
import type { BorrowerProfile } from "@/features/borrowers/types";
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

async function schoolIdBelongsToAnotherBorrower(schoolId: string, borrowerId?: string) {
  const existingBorrower = await appDb.borrowers.where("schoolId").equals(schoolId).first();

  if (!existingBorrower) {
    return false;
  }

  return existingBorrower.id !== borrowerId;
}

export async function listBorrowers(): Promise<BorrowerProfile[]> {
  return appDb.borrowers.orderBy("createdAt").reverse().toArray();
}

export async function getBorrowerById(id: string) {
  const trimmedId = id.trim();

  if (!trimmedId) {
    return null;
  }

  return (await appDb.borrowers.get(trimmedId)) ?? null;
}

export async function getBorrowerBySchoolId(schoolId: string) {
  const trimmedSchoolId = schoolId.trim();

  if (!trimmedSchoolId) {
    return null;
  }

  return (await appDb.borrowers.where("schoolId").equals(trimmedSchoolId).first()) ?? null;
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

    if (!existingBorrower || (await schoolIdBelongsToAnotherBorrower(schoolId, id))) {
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
    return await appDb.transaction("rw", appDb.borrowers, appDb.transactions, async () => {
      const existingBorrower = await appDb.borrowers.get(id);

      if (!existingBorrower) {
        return null;
      }

      await appDb.transactions.where("borrowerId").equals(id).modify({
        borrowerId: null,
      });
      await appDb.borrowers.delete(id);

      return existingBorrower;
    });
  } catch {
    return null;
  }
}

