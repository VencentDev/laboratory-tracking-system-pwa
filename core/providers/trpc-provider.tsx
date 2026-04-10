"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";

import { makeQueryClient } from "@/core/lib/query-client";
import { trpc } from "@/core/lib/trpc-client";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

type TrpcProviderProps = {
  children: React.ReactNode;
};

export function TrpcProvider({ children }: TrpcProviderProps) {
  const [queryClient] = useState(() => makeQueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
