import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground outline-none focus:border-primary text-base",
          className
        )}
        {...props}
      />
    );
  }
);
