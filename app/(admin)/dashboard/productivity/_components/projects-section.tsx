"use client";

import { addDays } from "date-fns";
import { ClipboardCheck, Globe, Orbit, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatNumber } from "@/lib/i18n/format";

const today = new Date("2024-04-15T12:00:00Z");

export function ProjectsSection() {
  const { locale, t } = useI18n();
  const projects = [
    {
      title: t("admin.productivity.projects.roadmapTitle"),
      status: t("admin.productivity.projects.inProgress"),
      description: t("admin.productivity.projects.roadmapDescription"),
      progress: 68,
      due: addDays(today, 9),
      icon: Orbit,
    },
    {
      title: t("admin.productivity.projects.websiteTitle"),
      status: t("admin.productivity.projects.planning"),
      description: t("admin.productivity.projects.websiteDescription"),
      progress: 42,
      due: addDays(today, 21),
      icon: Globe,
    },
    {
      title: t("admin.productivity.projects.onboardingTitle"),
      status: t("admin.productivity.projects.planning"),
      description: t("admin.productivity.projects.onboardingDescription"),
      progress: 31,
      due: addDays(today, 18),
      icon: ClipboardCheck,
    },
  ];
  const projectFilterItems = [
    { value: "active", label: t("admin.productivity.projects.active") },
    { value: "planning", label: t("admin.productivity.projects.planning") },
    { value: "completed", label: t("admin.productivity.projects.completed") },
  ];

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl tracking-tight">{t("admin.productivity.projects.title")}</h2>
        <div className="flex items-center gap-2">
          <Select defaultValue="active" items={projectFilterItems}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder={t("admin.productivity.projects.active")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {projectFilterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Plus data-icon="inline-start" />
            {t("admin.productivity.projects.new")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.title} className="shadow-xs">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <project.icon className="text-muted-foreground size-4" />
                  <span>{project.title}</span>
                </div>
              </CardTitle>
              <CardAction>
                <Badge variant="outline">{project.status}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="text-sm leading-none">{project.description}</div>
                <div className="flex items-center gap-3">
                  <Progress value={project.progress} className="h-2" />
                  <span className="shrink-0 text-sm">
                    {formatNumber(project.progress / 100, locale, { style: "percent" })}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-2.5">
              <span className="text-muted-foreground">
                {t("admin.productivity.projects.due", {
                  date: formatDate(project.due, locale, { month: "short", day: "numeric" }),
                })}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
