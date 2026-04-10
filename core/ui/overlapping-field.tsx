import type { ReactNode } from "react";

import { cn } from "@/core/lib/utils";
import { Label } from "@/core/ui/label";

type OverlappingFieldProps = {
  children: ReactNode;
  htmlFor: string;
  label: string;
  className?: string;
  labelClassName?: string;
};

export function OverlappingField({
  children,
  htmlFor,
  label,
  className,
  labelClassName,
}: OverlappingFieldProps) {
  return (
    <div className={cn("group relative w-full", className)}>
      <Label
        htmlFor={htmlFor}
        className={cn(
          "bg-background text-foreground absolute left-3 top-0 z-10 block -translate-y-1/2 px-1 text-xs",
          labelClassName,
        )}
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
