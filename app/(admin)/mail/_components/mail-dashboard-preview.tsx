"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";

export function MailDashboardPreview() {
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-medium text-sm leading-none">
            {t("admin.communications.mail.preview.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("admin.communications.mail.preview.description")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={
            <Link
              href="/mail"
              target="_blank"
              rel="noreferrer"
              prefetch={false}
              aria-label={t("admin.communications.mail.preview.open")}
            />
          }
        >
          <ExternalLink />
        </Button>
      </div>

      <iframe
        src="/mail"
        title={t("admin.communications.mail.preview.frameTitle")}
        className="min-h-0 flex-1 rounded-lg border bg-background"
      />
    </div>
  );
}
