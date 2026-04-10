"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/core/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center">
          <SidebarTrigger className="-ml-1" />
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
