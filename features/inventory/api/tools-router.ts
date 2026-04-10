import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/core/server/trpc";
import {
  createTool,
  deleteTool,
  getAllTools,
  getToolByBarcode,
  getToolById,
  updateTool,
} from "@/features/inventory/lib/queries";
import { toolSchema } from "@/features/inventory/lib/validations";

export const toolsRouter = createTRPCRouter({
  list: publicProcedure.query(async () => getAllTools()),
  byBarcode: publicProcedure
    .input(z.object({ barcode: z.string() }))
    .query(async ({ input }) => getToolByBarcode(input.barcode)),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => getToolById(input.id)),
  create: publicProcedure.input(toolSchema).mutation(async ({ input }) => createTool(input)),
  update: publicProcedure
    .input(toolSchema.extend({ id: z.number() }))
    .mutation(async ({ input }) => updateTool(input.id, input)),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => deleteTool(input.id)),
});
