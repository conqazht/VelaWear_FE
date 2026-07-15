"use client";

import { AnimatedStatus } from "@/components/errors/animated-status";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="relative">
      <LanguageSwitcher
        inverted
        showIcon={false}
        className="absolute right-4 top-4 z-30"
      />
      <AnimatedStatus
        code="500"
        title={t("admin.shell.error.title")}
        description={t("admin.shell.error.description")}
        primaryAction={{ label: t("admin.shell.error.tryAgain"), onClick: unstable_retry }}
        secondaryAction={{ label: t("admin.shell.error.openManagement"), href: "/dashboard/users" }}
        accent="#ff8f78"
        reference={error.digest}
        variant="panel"
      />
    </div>
  );
}
