import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider className="bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.04),transparent_28%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
      <AppSidebar variant="inset" />
      <SidebarInset>
        <DashboardHeader />
        <main className="min-w-0 flex-1 px-4 pb-8 pt-6 md:px-6 lg:px-8">
          <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
