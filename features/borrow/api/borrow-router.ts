import { createTRPCRouter, publicProcedure } from "@/core/server/trpc";
import {
  getAllTransactions,
  previewReturnTransaction,
  processScanTransaction,
} from "@/features/borrow/lib/queries";
import { returnPreviewInputSchema, scanInputSchema } from "@/features/borrow/lib/validations";

export const borrowRouter = createTRPCRouter({
  previewReturn: publicProcedure
    .input(returnPreviewInputSchema)
    .query(async ({ input }) => previewReturnTransaction(input.barcode)),
  processScan: publicProcedure
    .input(scanInputSchema)
    .mutation(async ({ input }) => processScanTransaction(input.barcode, input.mode, input.borrowerId)),
  listTransactions: publicProcedure.query(async () => getAllTransactions()),
});
