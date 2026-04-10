"use client";

import { trpc } from "@/core/lib/trpc-client";

export function useBorrowers() {
  return trpc.borrowers.list.useQuery();
}

export function useBorrower(id: string) {
  return trpc.borrowers.byId.useQuery(
    { id },
    {
      enabled: id.trim().length > 0,
    },
  );
}

export function useBorrowerBySchoolId(schoolId: string) {
  return trpc.borrowers.bySchoolId.useQuery(
    { schoolId },
    {
      enabled: schoolId.trim().length > 0,
    },
  );
}
