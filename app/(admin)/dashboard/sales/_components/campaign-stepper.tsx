import { Check } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function CampaignStepper({
  currentStep,
  onStepChange,
  disabled = false,
}: {
  currentStep: number;
  onStepChange: (step: 1 | 2 | 3) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const steps = [
    {
      value: 1,
      title: t("admin.sales.editor.step.details.title"),
      description: t("admin.sales.editor.step.details.description"),
    },
    {
      value: 2,
      title: t("admin.sales.editor.step.products.title"),
      description: t("admin.sales.editor.step.products.description"),
    },
    {
      value: 3,
      title: t("admin.sales.editor.step.review.title"),
      description: t("admin.sales.editor.step.review.description"),
    },
  ] as const;

  return (
    <ol
      className="grid gap-2 md:grid-cols-3"
      aria-label={t("admin.sales.editor.stepper.aria")}
    >
      {steps.map((step) => {
        const isActive = currentStep === step.value;
        const isComplete = currentStep > step.value;

        return (
          <li key={step.value}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
              aria-current={isActive ? "step" : undefined}
              disabled={disabled}
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
