"use client";

import { CheckSquare, FileText, Focus, Orbit, Upload } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";

const quickActions = [
  { labelKey: "admin.productivity.quick.note", icon: FileText },
  { labelKey: "admin.productivity.quick.task", icon: CheckSquare },
  { labelKey: "admin.productivity.quick.project", icon: Orbit },
  { labelKey: "admin.productivity.quick.goal", icon: Focus },
  { labelKey: "admin.productivity.quick.upload", icon: Upload },
] as const;

export function QuickActions() {
  const { t } = useI18n();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl tracking-tight">{t("admin.productivity.quick.title")}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {quickActions.map((action) => (
          <Button key={action.labelKey} variant="outline" className="justify-start">
            <action.icon data-icon="inline-start" />
            {t(action.labelKey)}
          </Button>
        ))}
      </div>
    </section>
  );
}
