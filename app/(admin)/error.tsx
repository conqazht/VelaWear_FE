"use client";

import { AnimatedStatus } from "@/components/errors/animated-status";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/providers/i18n-provider";

export default function AdminError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  const { t } = useI18n();
  const retry = reset ?? unstable_retry ?? (() => window.location.reload());

  return (
    <div className="relative min-h-dvh w-full bg-[#11100f]">
      <LanguageSwitcher inverted presentation="popover" className="absolute top-4 right-4 z-30" />
      <button type="button" onClick={reset ?? retry} className="sr-only">
        {t("admin.shell.error.tryAgain")}
      </button>
      <AnimatedStatus
        code="500"
        title={t("admin.shell.error.title")}
        description={t("admin.shell.error.description")}
        primaryAction={{ label: t("admin.shell.error.tryAgain"), onClick: retry }}
        secondaryAction={{ label: t("admin.shell.error.openManagement"), href: "/dashboard/users" }}
        accent="#ff8f78"
        reference={error.digest}
        variant="page"
      />
    </div>
  );
}

