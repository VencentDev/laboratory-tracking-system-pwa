import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/core/lib/utils";

type SettingsActionTileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  title: string;
  description: string;
  variant?: "primary" | "secondary";
};

export function SettingsActionTile({
  className,
  icon,
  title,
  description,
  variant = "secondary",
  type = "button",
  ...props
}: SettingsActionTileProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type={type}
      className={cn(
        "flex min-h-24 w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:opacity-50",
        isPrimary
          ? "border-foreground bg-foreground text-background shadow-sm hover:bg-foreground/92"
          : "border-border/80 bg-background/80 text-foreground shadow-sm hover:border-border hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          isPrimary
            ? "border-background/15 bg-background/10 text-background"
            : "border-border/70 bg-muted/35 text-foreground",
        )}
      >
        {icon}
      </span>

      <span className="space-y-1">
        <span className="block text-sm font-medium leading-5">{title}</span>
        <span className={cn("block text-xs leading-5", isPrimary ? "text-background/75" : "text-muted-foreground")}>
          {description}
        </span>
      </span>
    </button>
  );
}
