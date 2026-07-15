"use client";

import { useI18n } from "@/components/providers/i18n-provider";

import type { Task } from "./data";
import { Tasks } from "./tasks";

export function TasksPageContent({ data }: { data: Task[] }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl tracking-tight">{t("admin.workflows.tasks.welcome")}</h2>
        <p className="text-muted-foreground">{t("admin.workflows.tasks.description")}</p>
      </div>
      <Tasks data={data} />
    </div>
  );
}
