import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/core/server/trpc";
import {
  createBorrower,
  deleteBorrower,
  getAllBorrowers,
  getBorrowerById,
  getBorrowerBySchoolId,
  updateBorrower,
} from "@/features/borrowers/lib/queries";
import { borrowerSchema } from "@/features/borrowers/lib/validations";

export const borrowersRouter = createTRPCRouter({
  list: publicProcedure.query(async () => getAllBorrowers()),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => getBorrowerById(input.id)),
  bySchoolId: publicProcedure
    .input(z.object({ schoolId: z.string() }))
    .query(async ({ input }) => getBorrowerBySchoolId(input.schoolId)),
  create: publicProcedure.input(borrowerSchema).mutation(async ({ input }) => createBorrower(input)),
  update: publicProcedure
    .input(borrowerSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => updateBorrower(input.id, input)),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => deleteBorrower(input.id)),
  me: publicProcedure.query(() => null),
});
