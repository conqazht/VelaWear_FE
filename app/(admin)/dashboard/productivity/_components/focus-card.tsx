"use client";

import { BellOff } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FocusCard() {
  const { t } = useI18n();

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{t("admin.productivity.focus.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="text-3xl tracking-tight">90:00</div>
            <Button className="min-w-24">{t("admin.productivity.focus.start")}</Button>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <BellOff className="size-3" />
            <span>{t("admin.productivity.focus.quiet")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
