import { createTRPCRouter } from "@/core/server/trpc";
import { borrowRouter } from "@/features/borrow/api/borrow-router";
import { borrowersRouter } from "@/features/borrowers/api/borrowers-router";
import { toolsRouter } from "@/features/inventory/api/tools-router";

export const appRouter = createTRPCRouter({
  borrow: borrowRouter,
  borrowers: borrowersRouter,
  tools: toolsRouter,
});

export type AppRouter = typeof appRouter;
