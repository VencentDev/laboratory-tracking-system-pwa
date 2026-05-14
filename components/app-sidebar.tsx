"use client";

import * as React from "react";
import type { Route } from "next";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  PackagePlusIcon,
  Settings2Icon,
  SquareUserRoundIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react";
import { LogoutConfirmButton } from "@/features/auth/components/logout-confirm-button";
import { useAuth } from "@/features/auth/hooks/use-auth";

type SidebarNavItem = {
  title: string;
  url?: Route;
  icon: React.ReactNode;
  isActive?: boolean;
  items?: {
    title: string;
    url: Route;
  }[];
};

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin" as Route,
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Inventory",
    icon: <PackagePlusIcon />,
    isActive: true,
    items: [
      {
        title: "Manage Items",
        url: "/add-items" as Route,
      },
      {
        title: "Item Activity",
        url: "/item-logs" as Route,
      },
    ],
  },
  {
    title: "Borrowers",
    icon: <SquareUserRoundIcon />,
    isActive: true,
    items: [
      {
        title: "Manage Borrowers",
        url: "/register-borrower" as Route,
      },
      {
        title: "Borrower Activity",
        url: "/borrower-logs" as Route,
      },
    ],
  },
  {
    title: "Settings",
    icon: <Settings2Icon />,
    isActive: true,
    items: [
      {
        title: "Settings",
        url: "/settings" as Route,
      },
      {
        title: "Safety",
        url: "/trash" as Route,
      },
    ],
  },
  {
    title: "Trash",
    url: "/trash" as Route,
    icon: <Trash2Icon />,
  },
] satisfies SidebarNavItem[];

const fallbackNavItems = [
    {
      title: "Borrow & Return",
      url: "/scan" as Route,
      icon: <LayoutDashboardIcon />,
    },
] satisfies SidebarNavItem[];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { logout, session } = useAuth();
  const navItems = React.useMemo(
    () => (session?.role === "admin" ? adminNavItems : fallbackNavItems),
    [session?.role],
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-4 border-b border-sidebar-border/70 px-3 py-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-sidebar-border/70 bg-sidebar-primary text-sidebar-primary-foreground shadow-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg">
            <WrenchIcon className="size-4 group-data-[collapsible=icon]:size-3.5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-[-0.02em]">Laboratory Tracking</span>
            <span className="truncate text-xs text-sidebar-foreground/65">
              {session?.role === "admin"
                ? "Admin workspace"
                : session?.role === "toolkeeper"
                  ? session.name
                  : "Inventory and borrowing"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/70 px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutConfirmButton mode="sidebar" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
