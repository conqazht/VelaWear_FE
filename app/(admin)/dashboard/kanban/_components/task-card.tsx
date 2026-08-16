"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  FileText,
  Flame,
  type LucideIcon,
  MessageSquare,
  Minus,
  Paperclip,
} from "lucide-react";
import { parse } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getIntlLocale } from "@/lib/i18n";
import { cn, getInitials } from "@/lib/utils";

import { tagTones } from "./data";
import type { ColumnId, Task, TaskInsightLabel, TaskPriority, TaskTeam } from "./types";

const taskInsightIcons: Record<TaskInsightLabel, LucideIcon> = {
  Attachments: Paperclip,
  Comments: MessageSquare,
  Documents: FileText,
};

const priorityBadgeConfig: Record<
  TaskPriority,
  { icon: LucideIcon; variant: "destructive" | "secondary"; className: string }
> = {
  High: {
    icon: Flame,
    variant: "destructive",
    className: "border-transparent",
  },
  Low: {
    icon: Minus,
    variant: "secondary",
    className: "bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  },
  Medium: {
    icon: ArrowUpRight,
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
};

export function TaskCard({
  task,
  columnId,
  isOverlay = false,
}: {
  task: Task;
  columnId?: ColumnId;
  isOverlay?: boolean;
}) {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const percentFormatter = new Intl.NumberFormat(intlLocale, { style: "percent" });
  const dueDate = parse(task.dueDate, "MMM d", new Date(2024, 0, 1));
  const formattedDueDate = Number.isNaN(dueDate.getTime())
    ? task.dueDate
    : new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short" }).format(dueDate);
  const priorityNames: Record<TaskPriority, string> = {
    High: t("admin.workflows.common.high"),
    Low: t("admin.workflows.common.low"),
    Medium: t("admin.workflows.common.medium"),
  };
  const teamNames: Record<TaskTeam, string> = {
    Backend: t("admin.workflows.kanban.backend"),
    Data: t("admin.workflows.kanban.data"),
    Design: t("admin.workflows.kanban.design"),
    Docs: t("admin.workflows.kanban.docs"),
    "Finance Ops": t("admin.workflows.kanban.financeOps"),
    Platform: t("admin.workflows.kanban.platform"),
    Product: t("admin.workflows.kanban.product"),
    QA: t("admin.workflows.kanban.qa"),
    Security: t("admin.workflows.kanban.security"),
  };
  const insightLabels: Record<TaskInsightLabel, (count: string) => string> = {
    Attachments: (count) => t("admin.workflows.kanban.attachments", { count }),
    Comments: (count) => t("admin.workflows.kanban.comments", { count }),
    Documents: (count) => t("admin.workflows.kanban.documents", { count }),
  };
  const isDone = columnId === "shipped";
  const showBuildingDetails = columnId === "building" && typeof task.progress === "number";
  const owner = task.owner;
  const PriorityIcon = priorityBadgeConfig[task.priority].icon;

  return (
    <article
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-3 rounded-xl border p-4 shadow-xs",
        isOverlay && "w-68 rotate-1 shadow-lg",
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-sm leading-none font-medium">{task.title}</h3>
          <Badge
            variant={priorityBadgeConfig[task.priority].variant}
            className={cn(
              "shrink-0 rounded-md border-transparent px-2 font-medium",
              priorityBadgeConfig[task.priority].className,
            )}
          >
            <PriorityIcon data-icon="inline-start" />
            {priorityNames[task.priority]}
          </Badge>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-5">{task.description}</p>
      </div>

      {!showBuildingDetails ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar className={cn("size-5 after:rounded-sm", owner.tone)}>
              <AvatarFallback className="rounded-sm text-[10px]">
                {getInitials(owner.name)}
              </AvatarFallback>
            </Avatar>

            <span className="text-muted-foreground text-sm">{owner.name}</span>
          </div>

          <div className="text-muted-foreground flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm">{formattedDueDate}</span>
            <CalendarDays className="size-3" />
          </div>
        </div>
      ) : null}

      {showBuildingDetails ? (
        <div className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span className="leading-none">{t("admin.workflows.kanban.progress")}</span>
              <span className="leading-none tabular-nums">
                {percentFormatter.format(task.progress / 100)}
              </span>
            </div>
            <Progress value={task.progress} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">
                {t("admin.workflows.kanban.owner")}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground truncate text-sm">{owner.name}</span>
                <Avatar className={cn("size-5 after:rounded-sm", owner.tone)}>
                  <AvatarFallback className="rounded-sm text-[10px]">
                    {getInitials(owner.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">
                {t("admin.workflows.kanban.dueDate")}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="truncate text-sm">{formattedDueDate}</span>
                <CalendarDays className="size-3" />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">
                {t("admin.workflows.kanban.team")}
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-md border-transparent px-2 font-medium",
                  tagTones[task.team],
                )}
              >
                {teamNames[task.team]}
              </Badge>
            </div>
          </div>
        </div>
      ) : null}

      <Separator />

      <div>
        {isDone ? (
          <div className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-600">
            <BadgeCheck className="size-4" />
            {t("admin.workflows.kanban.done")}
          </div>
        ) : null}

        {!isDone ? (
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            {task.insights.map((insight) => {
              const Icon = taskInsightIcons[insight.label];

              return (
                <span
                  key={insight.label}
                  aria-label={insightLabels[insight.label](numberFormatter.format(insight.count))}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <Icon className="size-3.5" />
                  {numberFormatter.format(insight.count)}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}
