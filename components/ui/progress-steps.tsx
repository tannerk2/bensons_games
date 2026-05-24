import { Fragment } from "react";
import { cn } from "@/lib/utils";

export interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressSteps({ currentStep, totalSteps, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const reached = step <= currentStep;
        const passed = step < currentStep;
        return (
          <Fragment key={step}>
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                reached
                  ? "bg-primary text-primary-foreground"
                  : "bg-border text-muted-foreground"
              )}
              aria-current={step === currentStep ? "step" : undefined}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={cn(
                  "h-1 w-12 rounded-full transition-colors",
                  passed ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
