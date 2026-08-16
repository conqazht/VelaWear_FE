"use client";

import {
  ArrowUpDown,
  Bell,
  ChevronDown,
  CircleDashed,
  CircleGauge,
  Clock3,
  Copy,
  EllipsisVertical,
  FileText,
  Plus,
  RefreshCw,
  Settings,
  SquareTerminal,
  Terminal,
} from "lucide-react";

import { SimpleIcon } from "@/components/simple-icon";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

import type { InfrastructureEnvironment, InfrastructureGroup } from "./infrastructure-data";

const projectNameKeys = {
  "Admin Console": "admin.infrastructure.project.adminConsole",
  Analytics: "admin.infrastructure.project.analytics",
  Kanban: "admin.infrastructure.project.kanban",
  Inbox: "admin.infrastructure.project.inbox",
} as const;

const environmentKeys = {
  Expired: "admin.infrastructure.environment.expired",
  Production: "admin.infrastructure.environment.production",
  Staging: "admin.infrastructure.environment.staging",
} as const;

const healthKeys = {
  Online: "admin.infrastructure.health.online",
  Unhealthy: "admin.infrastructure.health.unhealthy",
} as const;

export function ProjectEnvironments({ group }: { group: InfrastructureGroup }) {
  const { t } = useI18n();
  const projectNameKey = projectNameKeys[group.name as keyof typeof projectNameKeys];

  return (
    <Collapsible
      defaultOpen
      className="bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl border py-3 data-open:gap-3 data-open:pb-0"
    >
      <div className="flex flex-col gap-2 px-4 sm:flex-row sm:items-center">
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              className="group -ml-2 h-auto w-full justify-start gap-2 px-2 py-1 hover:bg-transparent aria-expanded:bg-transparent sm:flex-1"
            />
          }
        >
          <ChevronDown className="group-data-panel-open:rotate-180" />
          <div className="flex min-w-0 items-baseline gap-1.5 text-left">
            <span className="shrink-0 leading-none font-medium">{group.organization}</span>
            <span className="text-muted-foreground min-w-0 truncate text-sm">
              ({projectNameKey ? t(projectNameKey) : group.name})
            </span>
          </div>
        </CollapsibleTrigger>
        <div className="flex w-full items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          <Button variant="ghost" size="sm" className="-ml-1.5 sm:ml-0">
            <Plus data-icon="inline-start" />
            {t("admin.infrastructure.addEnvironment")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={t("admin.infrastructure.projectActions")}
                />
              }
            >
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuGroup>
                {group.rows.length > 0 ? (
                  <DropdownMenuItem>
                    <FileText />
                    {t("admin.infrastructure.activityLogs")}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem>
                  <Terminal />
                  {t("admin.infrastructure.openConsole")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  {t("admin.infrastructure.projectSettings")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCw />
                  {t("admin.infrastructure.syncStatus")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  {t("admin.infrastructure.manageAlerts")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Copy />
                  {t("admin.infrastructure.copyProjectId")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CollapsibleContent>
        {group.rows.length > 0 ? <EnvironmentTable rows={group.rows} /> : <EmptyProjectState />}
      </CollapsibleContent>
    </Collapsible>
  );
}

function EnvironmentTable({ rows }: { rows: InfrastructureEnvironment[] }) {
  const { locale, t } = useI18n();

  return (
    <div className="[&::-webkit-scrollbar-thumb]:bg-border scrollbar-thin [scrollbar-color:var(--border)_transparent] overflow-x-auto **:data-[slot=table-container]:overflow-visible [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
      <Table className="min-w-[1700px] table-fixed **:data-[slot='table-cell']:px-5 **:data-[slot='table-head']:px-5">
        <colgroup>
          <col className="w-90" />
          <col className="w-40" />
          <col className="w-42" />
          <col className="w-35" />
          <col className="w-35" />
          <col className="w-38" />
          <col className="w-98" />
          <col className="w-55" />
          <col className="w-18" />
        </colgroup>
        <TableHeader className="bg-muted/50 [&_tr]:border-y">
          <TableRow>
            <TableHead className="font-medium">
              <span className="inline-flex items-center gap-1">
                {t("admin.infrastructure.column.domain")}{" "}
                <ArrowUpDown className="size-4" aria-hidden="true" />
              </span>
            </TableHead>
            <TableHead>{t("admin.infrastructure.column.platform")}</TableHead>
            <TableHead>{t("admin.infrastructure.column.environment")}</TableHead>
            <TableHead>{t("admin.infrastructure.column.health")}</TableHead>
            <TableHead>{t("admin.infrastructure.column.latency")}</TableHead>
            <TableHead>{t("admin.infrastructure.column.uptime")}</TableHead>
            <TableHead>{t("admin.infrastructure.column.resources")}</TableHead>
            <TableHead>{t("admin.infrastructure.column.server")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className="**:data-[slot='table-row']:hover:bg-transparent">
          {rows.map((row) => (
            <TableRow key={row.domain}>
              <TableCell>
                <span className="block truncate font-medium" title={row.domain}>
                  {row.domain}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground flex items-center gap-2 font-medium">
                  <SimpleIcon icon={row.platform.icon} className="size-4 fill-current" />
                  {row.platform.name}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={row.environment === "Expired" ? "destructive" : "secondary"}
                  className={cn(
                    "rounded-sm px-1.5 py-0.5",
                    row.environment === "Production" &&
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    row.environment === "Staging" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                  )}
                >
                  {t(environmentKeys[row.environment])}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={row.status === "Online" ? "secondary" : "destructive"}
                  className={cn(
                    "rounded-sm px-1.5 py-0.5",
                    row.status === "Online" &&
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      row.status === "Online" ? "bg-emerald-500" : "bg-destructive",
                    )}
                  />
                  {t(healthKeys[row.status])}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground inline-flex items-center gap-1.5 tabular-nums">
                  <CircleGauge className="size-4" />
                  {formatNumber(row.latencyMs, locale)} ms
                </span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground inline-flex items-center gap-1.5 tabular-nums">
                  <Clock3 className="size-4" />
                  {t("admin.infrastructure.uptime", {
                    days: formatNumber(row.uptime.days, locale),
                    hours: formatNumber(row.uptime.hours, locale),
                  })}
                </span>
              </TableCell>
              <TableCell>
                <div className="grid grid-cols-3 gap-4">
                  <ResourceMeter label="CPU" value={row.resources.cpu} />
                  <ResourceMeter label="RAM" value={row.resources.ram} />
                  <ResourceMeter
                    label={t("admin.infrastructure.resource.disk")}
                    value={row.resources.disk}
                  />
                </div>
              </TableCell>
              <TableCell>
                <span className="flex flex-col font-medium">
                  {row.server === "Bare Metal / Custom"
                    ? t("admin.infrastructure.server.custom")
                    : row.server}
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "ring-foreground/10 shrink-0 rounded-xs text-sm ring-1",
                        `flag:${row.countryCode}`,
                      )}
                    />
                    {row.countryCode} · {row.plan}
                  </span>
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="-mr-2"
                        aria-label={t("admin.infrastructure.rowActions", { domain: row.domain })}
                      />
                    }
                  >
                    <SquareTerminal />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <FileText />
                        {t("admin.infrastructure.viewLogs")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Terminal />
                        {t("admin.infrastructure.openConsole")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw />
                        {t("admin.infrastructure.restart")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Copy />
                        {t("admin.infrastructure.copyUrl")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ResourceMeter({ label, value }: { label: string; value: number }) {
  const { locale } = useI18n();
  const isCritical = value >= 70;
  const isWarning = value >= 55;

  return (
    <span className="min-w-0 space-y-1">
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span
          className={cn(
            "font-medium text-emerald-600 tabular-nums dark:text-emerald-400",
            isWarning && "text-amber-600 dark:text-amber-400",
            isCritical && "text-destructive",
          )}
        >
          {formatNumber(value / 100, locale, { style: "percent" })}
        </span>
      </span>
      <span className="bg-muted-foreground/20 block h-1.5 overflow-hidden rounded-full">
        <span
          className={cn(
            "block h-full rounded-full bg-emerald-500",
            isWarning && "bg-amber-500",
            isCritical && "bg-destructive",
          )}
          style={{ width: `${value}%` }}
        />
      </span>
    </span>
  );
}

function EmptyProjectState() {
  const { t } = useI18n();

  return (
    <div className="bg-muted/50 flex min-h-24 items-center justify-center border-t p-4">
      <div className="flex items-center gap-2">
        <CircleDashed className="size-4" />
        <p className="text-sm font-medium">{t("admin.infrastructure.empty")}</p>
      </div>
    </div>
  );
}
