"use client";

import { useI18n } from "@/components/providers/i18n-provider";

import { CalendarPanel } from "./calendar-panel";
import { FocusCard } from "./focus-card";
import { ProjectsSection } from "./projects-section";
import { QuickActions } from "./quick-actions";
import { QuoteCard } from "./quote-card";
import { RecentNotesCard } from "./recent-notes-card";
import { SummaryCards } from "./summary-cards";
import { TasksSection } from "./tasks-section";
import { WeeklySummaryCard } from "./weekly-summary-card";

export function ProductivityDashboard() {
  const { t } = useI18n();

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section className="lg:col-span-9">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl text-foreground leading-none tracking-tight">
              {t("admin.productivity.greeting", { name: "Arham" })}
            </h1>
            <p className="text-lg text-muted-foreground leading-none">{t("admin.productivity.intro")}</p>
          </div>
          <SummaryCards />
          <TasksSection />
          <ProjectsSection />
          <QuickActions />
          <QuoteCard />
        </div>
      </section>

      <section className="flex flex-col gap-6 lg:col-span-3">
        <CalendarPanel />
        <FocusCard />
        <RecentNotesCard />
        <WeeklySummaryCard />
      </section>
    </div>
  );
}
