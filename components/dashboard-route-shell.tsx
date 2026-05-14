"use client";

import { useEffect, type ReactNode } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebarShell } from "@/components/dashboard-sidebar-shell";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/core/components/theme-toggle";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { LogoutConfirmButton } from "@/features/auth/components/logout-confirm-button";
import { useAuth } from "@/features/auth/hooks/use-auth";

type DashboardRouteShellProps = {
  children: ReactNode;
};

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

  useEffect(() => {
    if (session?.role === "toolkeeper" && pathname !== "/scan") {
      router.replace("/scan" as Route);
    }
  }, [pathname, router, session]);

  if (session?.role === "toolkeeper") {
    if (pathname !== "/scan") {
      return null;
    }

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.04),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-[-0.02em]">{session.name}</div>
              <div className="truncate text-xs text-muted-foreground">Borrow & Return</div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutConfirmButton />
            </div>
          </div>
        </header>
        <main className="min-w-0 px-4 pb-8 pt-6 md:px-6 lg:px-8">
          <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    );
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
