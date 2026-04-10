import type { ReactNode } from "react";

import { cn } from "@/core/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow = "Workspace",
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground/90">{eyebrow}</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">{title}</h1>
          {description ? <p className="text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
