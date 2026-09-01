"use client";

import { AnimatedStatus } from "@/components/errors/animated-status";
import { useI18n } from "@/components/providers/i18n-provider";

export function DashboardNotFoundContent() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] w-full flex-1 flex-col">
      <AnimatedStatus
        code="404"
        title={t("admin.shell.notFound.title")}
        description={t("admin.shell.notFound.description")}
        primaryAction={{
          label: t("admin.shell.error.openManagement"),
          href: "/dashboard/users",
        }}
        secondaryAction={{
          label: t("admin.shell.notFound.dashboardHome"),
          href: "/dashboard/default",
        }}
        accent="#f7f4ef"
        variant="panel"
        className="min-h-[calc(100dvh-8rem)] flex-1"
      />
    </div>
  );
}
