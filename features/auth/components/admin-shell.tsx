"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebarShell } from "@/components/dashboard-sidebar-shell";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthGuard } from "@/features/auth/components/auth-guard";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <AuthGuard requiredRole="admin">
      <SidebarProvider className="bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.04),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
        <DashboardSidebarShell />
        <SidebarInset>
          <DashboardHeader />
          <main className="min-w-0 flex-1 px-4 pb-8 pt-6 md:px-6 lg:px-8">
            <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
