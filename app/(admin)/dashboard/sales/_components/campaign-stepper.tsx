import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { value: 1, title: "Campaign details", description: "Type and schedule" },
  { value: 2, title: "Products & pricing", description: "Variants and limits" },
  { value: 3, title: "Review", description: "Validate and save" },
] as const;

export function CampaignStepper({
  currentStep,
  onStepChange,
}: {
  currentStep: number;
  onStepChange: (step: 1 | 2 | 3) => void;
}) {
  return (
    <ol className="grid gap-2 md:grid-cols-3" aria-label="Campaign form steps">
      {STEPS.map((step) => {
        const isActive = currentStep === step.value;
        const isComplete = currentStep > step.value;

        return (
          <li key={step.value}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
              aria-current={isActive ? "step" : undefined}
              onClick={() => onStepChange(step.value)}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isActive || isComplete
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : step.value}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{step.title}</span>
                <span className="block truncate text-muted-foreground text-xs">
                  {step.description}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
