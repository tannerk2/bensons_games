import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function Badge({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
