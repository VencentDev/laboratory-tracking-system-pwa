import * as React from "react";

import { cn } from "@/core/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-border/80 bg-background/90 px-4 py-2 text-sm text-foreground shadow-sm transition-[border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-muted-foreground/80 hover:border-foreground/15 focus-visible:border-foreground/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50 aria-invalid:border-destructive/40 aria-invalid:ring-4 aria-invalid:ring-destructive/15",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
