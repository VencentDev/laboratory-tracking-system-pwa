import type { ReactNode } from "react";

import { DashboardRouteShell } from "@/components/dashboard-route-shell";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardRouteShell>{children}</DashboardRouteShell>;
}
