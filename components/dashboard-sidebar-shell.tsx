"use client";

import dynamic from "next/dynamic";

const AppSidebar = dynamic(
  () => import("@/components/app-sidebar").then((module) => module.AppSidebar),
  {
    ssr: false,
  },
);

export function DashboardSidebarShell() {
  return <AppSidebar variant="inset" />;
}
