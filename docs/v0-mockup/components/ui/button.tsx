import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          // Variants
          variant === "primary" &&
            "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg",
          variant === "secondary" &&
            "bg-secondary text-white hover:bg-secondary-dark shadow-md hover:shadow-lg",
          variant === "outline" &&
            "border-2 border-primary text-primary hover:bg-primary hover:text-white",
          variant === "ghost" &&
            "text-foreground-muted hover:bg-surface hover:text-foreground",
          variant === "success" &&
            "bg-success text-white hover:bg-success-dark shadow-md hover:shadow-lg",
          variant === "danger" &&
            "bg-error text-white hover:bg-error-dark shadow-md hover:shadow-lg",
          // Sizes
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
