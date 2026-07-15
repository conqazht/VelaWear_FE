"use client";

import * as React from "react";

import { useCalendarController } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import viLocale from "@fullcalendar/react/locales/vi";
import multiMonthPlugin from "@fullcalendar/react/multimonth";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { differenceInCalendarDays, endOfMonth, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, XIcon } from "lucide-react";

import { EventCalendarViews } from "@/components/calendar/event-calendar-views";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIntlLocale } from "@/lib/i18n";

import { demoEvents } from "./events-data";

const plugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin];

export function Calendar() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const numberFormatter = new Intl.NumberFormat(intlLocale);
  const monthFormatter = new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" });
  const views = [
    { value: "dayGridMonth", label: t("admin.workflows.calendar.month") },
    { value: "timeGridWeek", label: t("admin.workflows.calendar.week") },
    { value: "timeGridDay", label: t("admin.workflows.calendar.day") },
  ];
  const calendars = [
    { value: "all", label: t("admin.workflows.calendar.allCalendars") },
    { value: "work", label: t("admin.workflows.calendar.work") },
    { value: "personal", label: t("admin.workflows.calendar.personal") },
    { value: "team", label: t("admin.workflows.calendar.team") },
    { value: "focus", label: t("admin.workflows.calendar.focusTime") },
  ];
  const controller = useCalendarController();
  const [eventCount, setEventCount] = React.useState(0);
  const [selectedCalendar, setSelectedCalendar] = React.useState("all");
  const [dateInfo, setDateInfo] = React.useState(() => {
    const now = new Date("2024-04-15T12:00:00Z");

    return {
      title: monthFormatter.format(now),
      days: differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1,
    };
  });
  const title = dateInfo.title;
  const days = dateInfo.days;

  return (
    <div className="flex flex-col overflow-hidden rounded-md border">
      <div className="flex flex-col gap-4 border-b bg-sidebar p-4 text-sidebar-foreground lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 shrink-0 flex-col gap-1">
          <div className="font-medium text-lg leading-none">{title}</div>
          <p className="text-muted-foreground text-sm">
            {t("admin.workflows.calendar.summary", {
              days: numberFormatter.format(days),
              events: numberFormatter.format(eventCount),
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedCalendar}
            onValueChange={(value) => {
              if (value !== null) setSelectedCalendar(value);
            }}
            items={calendars}
          >
            <SelectTrigger className="w-full sm:w-44">
              <CalendarIcon />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectGroup>
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.value} value={calendar.value}>
                    {calendar.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <ButtonGroup>
            <Button
              aria-label={t("admin.workflows.calendar.previous")}
              size="icon"
              variant="outline"
              onClick={() => controller.prev()}
            >
              <ChevronLeft />
            </Button>
            <Button variant="outline" onClick={() => controller.today()}>
              {t("admin.workflows.calendar.today")}
            </Button>
            <Button
              aria-label={t("admin.workflows.calendar.next")}
              size="icon"
              variant="outline"
              onClick={() => controller.next()}
            >
              <ChevronRight />
            </Button>
          </ButtonGroup>
          <Select
            value={controller.view?.type ?? views[0].value}
            onValueChange={(value) => {
              if (value !== null) controller.changeView(value);
            }}
            items={views}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectGroup>
                {views.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <Plus />
            {t("admin.workflows.calendar.addEvent")}
          </Button>
        </div>
      </div>

      <EventCalendarViews
        controller={controller}
        initialView={views[0].value}
        locale={locale}
        locales={[viLocale]}
        plugins={[...plugins]}
        popoverCloseContent={() => <XIcon className="size-5 text-muted-foreground group-hover:text-foreground" />}
        events={demoEvents}
        nowIndicator
        datesSet={(info) => {
          setDateInfo({
            title: info.view.title,
            days: differenceInCalendarDays(info.view.currentEnd, info.view.currentStart),
          });
          setEventCount(
            demoEvents.filter((event) => {
              const start = new Date(event.start);

              return start >= info.start && start < info.end;
            }).length,
          );
        }}
      />
    </div>
  );
}
