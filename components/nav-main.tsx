"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: Route;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: Route;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  function isRouteActive(url: Route) {
    if (!hasMounted) {
      return false;
    }

    return pathname === url || pathname.startsWith(`${url}/`);
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items?.length);
          const hasActiveChild = item.items?.some(
            (subItem) => isRouteActive(subItem.url)
          );

          if (hasChildren && item.items) {
            if (isCollapsed) {
              return (
                <SidebarMenuItem
                  key={item.title}
                  className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={hasActiveChild}
                        className={cn(
                          hasActiveChild &&
                            "bg-sidebar-primary/12 text-sidebar-foreground shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border)),inset_3px_0_0_hsl(var(--sidebar-primary))]",
                        )}
                      >
                        {item.icon}
                        <span className="sr-only">{item.title}</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      sideOffset={0}
                      alignOffset={30}
                      className="w-30 min-w-0 rounded-lg p-1"
                    >
                      {item.items.map((subItem) => {
                        const isActive = isRouteActive(subItem.url);

                        return (
                          <DropdownMenuItem
                            key={subItem.title}
                            asChild
                            className={isActive ? "px-2.5 py-1.5 text-xs bg-accent text-accent-foreground" : "px-2.5 py-1.5 text-xs"}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive ?? hasActiveChild}
                className="group/collapsible"
              >
                <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={hasActiveChild}
                      className={cn(
                        hasActiveChild &&
                          "bg-sidebar-primary/12 text-sidebar-foreground shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border)),inset_3px_0_0_hsl(var(--sidebar-primary))]",
                      )}
                    >
                      {item.icon}
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isActive = isRouteActive(subItem.url);

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive}
                              className={cn(
                                isActive &&
                                  "bg-sidebar-primary/10 text-sidebar-foreground shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border)),inset_2px_0_0_hsl(var(--sidebar-primary))]",
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          if (!item.url) {
            return null;
          }

          const isItemActive = isRouteActive(item.url);

          return (
            <SidebarMenuItem
              key={item.title}
              className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
            >
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isItemActive}
                className={cn(
                  isItemActive &&
                    "bg-sidebar-primary/12 text-sidebar-foreground shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border)),inset_3px_0_0_hsl(var(--sidebar-primary))]",
                )}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
