"use client";

import { useEffect, type ReactNode } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebarShell } from "@/components/dashboard-sidebar-shell";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useAuth } from "@/features/auth/hooks/use-auth";

type DashboardRouteShellProps = {
  children: ReactNode;
};

const toolkeeperPaths = new Set(["/scan", "/add-items", "/register-borrower"]);

export function DashboardRouteShell({ children }: DashboardRouteShellProps) {
  return (
    <AuthGuard requiredRole="any">
      <AuthenticatedDashboardRouteShell>{children}</AuthenticatedDashboardRouteShell>
    </AuthGuard>
  );
}

function AuthenticatedDashboardRouteShell({ children }: DashboardRouteShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();
  const isToolkeeperPath = toolkeeperPaths.has(pathname);

  useEffect(() => {
    if (session?.role === "toolkeeper" && !isToolkeeperPath) {
      router.replace("/scan" as Route);
    }
  }, [isToolkeeperPath, router, session]);

  if (session?.role === "toolkeeper" && !isToolkeeperPath) {
    return null;
  }

  return (
    <SidebarProvider className="bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.04),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
      <DashboardSidebarShell />
      <SidebarInset>
        <DashboardHeader />
        <main className="min-w-0 flex-1 px-4 pb-8 pt-6 md:px-6 lg:px-8">
          <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
