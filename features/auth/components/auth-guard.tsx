"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/use-auth";

type AuthGuardProps = {
  children: ReactNode;
  requiredRole: "admin" | "toolkeeper" | "any";
};

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { isLoading, session } = useAuth();
  const isAllowed =
    session !== null && (requiredRole === "any" || session.role === requiredRole);

  useEffect(() => {
    if (isLoading || isAllowed) {
      return;
    }

    router.replace("/");
  }, [isAllowed, isLoading, router]);

  if (isLoading || !isAllowed) {
    return null;
  }

  return children;
}
