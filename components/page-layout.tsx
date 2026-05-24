import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  /** Wider layouts (e.g. game library) can opt for a larger max-width. */
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<PageLayoutProps["size"]>, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
};

export function PageLayout({ children, className, size = "lg" }: PageLayoutProps) {
  return (
    <main className="flex-1 px-4 py-8 sm:py-12">
      <div className={cn("mx-auto", sizeClasses[size], className)}>
        {children}
      </div>
    </main>
  );
}
