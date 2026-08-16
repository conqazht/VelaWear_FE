"use client";

import { Check, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export type PasswordRequirementsProps = {
  password: string;
  showTitle?: boolean;
  className?: string;
};

export function PasswordRequirements({
  password,
  showTitle = true,
  className,
}: PasswordRequirementsProps) {
  const { t } = useI18n();

  const hasMinLength = password.length >= 8;
  const hasUpperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const requirements = [
    {
      id: "min-length",
      label: t("account.password.reqMinChars"),
      met: hasMinLength,
    },
    {
      id: "case",
      label: t("account.password.reqCase"),
      met: hasUpperAndLower,
    },
    {
      id: "number",
      label: t("account.password.reqNumber"),
      met: hasNumber,
    },
  ];

  return (
    <div className={cn("space-y-2 text-left select-none", className)}>
      {showTitle && (
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/70 mb-2">
          {t("account.password.requirements")}
        </p>
      )}
      <div className="flex flex-col gap-1.5 text-xs">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={cn(
              "flex items-center gap-2 transition-colors duration-200",
              req.met ? "text-emerald-700 font-medium" : "text-red-500"
            )}
          >
            {req.met ? (
              <Check className="size-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
            ) : (
              <X className="size-3.5 text-red-500 stroke-[2.5] shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
