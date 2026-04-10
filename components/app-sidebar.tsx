"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  PackagePlusIcon,
  QrCodeIcon,
  Settings2Icon,
  SquareUserRoundIcon,
  WrenchIcon,
} from "lucide-react";

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

const data = {
  navMain: [
    {
      title: "Borrow & Return",
      url: "/scan" as Route,
      icon: <QrCodeIcon />,
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
  ] satisfies SidebarNavItem[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              Inventory and borrowing
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/70 px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings2Icon />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
