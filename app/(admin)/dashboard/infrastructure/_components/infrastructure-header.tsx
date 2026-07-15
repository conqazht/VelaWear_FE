"use client";

import { Box, Container, Filter, PlusCircle, RefreshCw, Search, Server, Settings } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { formatNumber } from "@/lib/i18n/format";

export function InfrastructureHeader() {
  const { locale, t } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
              {t("admin.infrastructure.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("admin.infrastructure.description")}
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <span className="whitespace-nowrap text-muted-foreground text-sm">{t("admin.infrastructure.updated", { seconds: formatNumber(30, locale) })}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" aria-label={t("admin.infrastructure.refresh")}>
                <RefreshCw />
              </Button>
              <Button variant="outline" size="icon-sm" aria-label={t("admin.infrastructure.settings")}>
                <Settings data-icon="inline-start" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Container />{t("admin.infrastructure.projects", { count: formatNumber(6, locale) })}
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Box />
            {t("admin.infrastructure.environments", { count: formatNumber(16, locale) })}
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <Server />
            {t("admin.infrastructure.servers", { count: formatNumber(36, locale) })}
          </Badge>
          <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
            <span className="size-2 rounded-full bg-green-600 dark:bg-green-500" />
            {t("admin.infrastructure.globalUptime", { uptime: formatNumber(99.93, locale, { maximumFractionDigits: 2 }) })}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row">
        <InputGroup className="flex-1">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder={t("admin.infrastructure.search")} />
          <InputGroupAddon align="inline-end">
            <Kbd>⌘ K</Kbd>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("admin.infrastructure.organization")}
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("admin.infrastructure.stack")}
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("admin.infrastructure.cloudProvider")}
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("admin.infrastructure.projectType")}
          </Button>
          <Button variant="outline">
            <PlusCircle data-icon="inline-start" />
            {t("admin.infrastructure.environment")}
          </Button>
          <Button variant="outline">
            <Filter data-icon="inline-start" />
            {t("admin.infrastructure.filters")}
          </Button>
        </div>
      </div>
    </div>
  );
}
