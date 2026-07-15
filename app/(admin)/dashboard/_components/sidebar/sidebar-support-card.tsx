"use client";

import Link from "next/link";

import { siX } from "simple-icons";

import { useI18n } from "@/components/providers/i18n-provider";
import { SimpleIcon } from "@/components/simple-icon";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  const { t } = useI18n();

  return (
    <Card size="sm" className="overflow-hidden shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="min-w-0 px-4">
        <CardTitle className="truncate text-sm">{t("admin.shell.support.title")}</CardTitle>
        <CardDescription className="line-clamp-2">
          {t("admin.shell.support.description")} {" "}
          <Link
            href="https://x.com/arhamkhnz"
            target="_blank"
            rel="noreferrer"
            aria-label={t("admin.shell.support.reachOut")}
            className="inline-flex items-center text-foreground"
          >
            <SimpleIcon icon={siX} aria-hidden className="size-3 fill-current" />
          </Link>
          .
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
