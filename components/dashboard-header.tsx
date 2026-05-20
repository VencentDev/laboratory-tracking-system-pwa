"use client";

import { useState } from "react";
import { InfoIcon } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/core/ui/button";
import { ThemeToggle } from "@/core/components/theme-toggle";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function DashboardHeader() {
  const { session } = useAuth();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center">
          <SidebarTrigger className="-ml-1" />
        </div>

        <div className="flex items-center gap-1">
          {session?.role === "toolkeeper" ? (
            <Tooltip open={isInfoOpen}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Toolkeeper reminders"
                  onBlur={() => setIsInfoOpen(false)}
                  onClick={() => setIsInfoOpen((currentValue) => !currentValue)}
                  onFocus={() => setIsInfoOpen(true)}
                  onMouseEnter={() => setIsInfoOpen(true)}
                  onMouseLeave={() => setIsInfoOpen(false)}
                >
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end" side="bottom" sideOffset={8} className="max-w-[280px] px-4 py-3">
                <ul className="list-disc space-y-1 pl-4 text-left leading-relaxed">
                  <li>Log out once you are done.</li>
                  <li>You can only edit borrowers and tools you created during this session.</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
