"use client";

import * as React from "react";

import { Calendar1, Plus } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/i18n/format";

type Task = {
  titleKey:
    | "admin.productivity.tasks.roadmap"
    | "admin.productivity.tasks.design"
    | "admin.productivity.tasks.emails"
    | "admin.productivity.tasks.content"
    | "admin.productivity.tasks.notes";
  tagKey:
    | "admin.productivity.tag.work"
    | "admin.productivity.tag.design"
    | "admin.productivity.tag.admin"
    | "admin.productivity.tag.content"
    | "admin.productivity.tag.planning";
  hour: number;
  minute: number;
  checked: boolean;
};

const tasks: Task[] = [
  { titleKey: "admin.productivity.tasks.roadmap", tagKey: "admin.productivity.tag.work", hour: 10, minute: 0, checked: false },
  { titleKey: "admin.productivity.tasks.design", tagKey: "admin.productivity.tag.design", hour: 11, minute: 30, checked: true },
  { titleKey: "admin.productivity.tasks.emails", tagKey: "admin.productivity.tag.admin", hour: 14, minute: 0, checked: false },
  { titleKey: "admin.productivity.tasks.content", tagKey: "admin.productivity.tag.content", hour: 16, minute: 30, checked: false },
  { titleKey: "admin.productivity.tasks.notes", tagKey: "admin.productivity.tag.planning", hour: 18, minute: 0, checked: false },
];

export function TasksSection() {
  const { locale, t } = useI18n();
  const [items, setItems] = React.useState(tasks);
  const taskRangeItems = [
    { value: "today", label: t("admin.productivity.tasks.today") },
    { value: "tomorrow", label: t("admin.productivity.tasks.tomorrow") },
    { value: "this-week", label: t("admin.productivity.tasks.week") },
  ];

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl tracking-tight">{t("admin.productivity.tasks.title")}</h2>
        <div className="flex items-center gap-2">
          <Select defaultValue="today" items={taskRangeItems}>
            <SelectTrigger className="w-30">
              <SelectValue placeholder={t("admin.productivity.tasks.today")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {taskRangeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <Plus data-icon="inline-start" />
            {t("admin.productivity.tasks.new")}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
        <div className="divide-y">
          {items.map((task) => {
            const title = t(task.titleKey);
            return (
            <div key={task.titleKey} className="flex items-center gap-2 p-4">
              <Checkbox
                checked={task.checked}
                aria-label={title}
                onCheckedChange={(checked) => {
                  setItems((current) =>
                    current.map((item) => (item.titleKey === task.titleKey ? { ...item, checked: checked === true } : item)),
                  );
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                    <span className="truncate text-sm">{title}</span>
                    <Badge variant="outline" className="px-3 py-1 font-normal">
                      {t(task.tagKey)}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-muted-foreground text-sm">
                    <span>{formatDate(new Date(2024, 3, 15, task.hour, task.minute), locale, { hour: "numeric", minute: "2-digit" })}</span>
                    <Calendar1 className="size-4" />
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
