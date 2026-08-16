"use client";

import { subDays } from "date-fns";
import { BookOpen, FileText } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/i18n/format";

const today = new Date("2024-04-15T12:00:00Z");

export function RecentNotesCard() {
  const { locale, t } = useI18n();
  const formatNoteDate = (daysAgo: number) => {
    if (daysAgo === 0) return t("admin.productivity.notes.today");
    if (daysAgo === 1) return t("admin.productivity.notes.yesterday");
    return formatDate(subDays(today, daysAgo), locale, { month: "short", day: "numeric" });
  };
  const recentNotes = [
    { title: t("admin.productivity.notes.design"), date: formatNoteDate(0), icon: FileText },
    {
      title: t("admin.productivity.notes.content", {
        month: formatDate(today, locale, { month: "long" }),
      }),
      date: formatNoteDate(1),
      icon: FileText,
    },
    { title: t("admin.productivity.notes.lessons"), date: formatNoteDate(4), icon: FileText },
    { title: t("admin.productivity.notes.books"), date: formatNoteDate(5), icon: BookOpen },
  ];

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{t("admin.productivity.notes.title")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            {t("admin.productivity.viewAll")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {recentNotes.map((note) => (
          <div key={note.title} className="flex items-start gap-4">
            <note.icon className="text-muted-foreground size-5" />
            <div className="min-w-0">
              <div className="truncate text-sm leading-none font-medium">{note.title}</div>
              <div className="text-muted-foreground text-xs">{note.date}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
