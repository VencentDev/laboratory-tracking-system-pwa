"use client";

import { useLiveQuery } from "dexie-react-hooks";

import {
  getBorrowerById,
  getBorrowerBySchoolId,
  listBorrowers,
} from "@/features/borrowers/lib/borrower-repository";

export function useBorrowers() {
  const data = useLiveQuery(() => listBorrowers(), []);

  return {
    data,
    isLoading: data === undefined,
  };
}

export function useBorrower(id: string) {
  const trimmedId = id.trim();
  const data = useLiveQuery(
    async () => {
      if (!trimmedId) {
        return null;
      }

      return getBorrowerById(trimmedId);
    },
    [trimmedId],
  );

  return {
    data: trimmedId ? data : null,
    isLoading: Boolean(trimmedId) && data === undefined,
  };
}

export function useBorrowerBySchoolId(schoolId: string) {
  const trimmedSchoolId = schoolId.trim();
  const data = useLiveQuery(
    async () => {
      if (!trimmedSchoolId) {
        return null;
      }

      return getBorrowerBySchoolId(trimmedSchoolId);
    },
    [trimmedSchoolId],
  );

  return {
    data: trimmedSchoolId ? data : null,
    isLoading: Boolean(trimmedSchoolId) && data === undefined,
  };
}
