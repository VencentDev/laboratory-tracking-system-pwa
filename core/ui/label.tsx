import * as React from "react";

import { cn } from "@/core/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return <label ref={ref} className={cn("text-sm font-medium", className)} {...props} />;
  },
);

Label.displayName = "Label";

export { Label };
