import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { db } from "@/core/db";

export function createTRPCContext() {
  return {
    db,
  };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
