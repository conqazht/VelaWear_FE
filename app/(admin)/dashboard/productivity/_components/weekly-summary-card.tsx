"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function WeeklySummaryCard() {
  const { t } = useI18n();

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{t("admin.productivity.weekly.title")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            {t("admin.productivity.viewAll")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("admin.productivity.weekly.encouragement")}</p>
        <div className="flex flex-col gap-2">
          <div className="font-medium">
            {t("admin.productivity.weekly.goals", { completed: 4, total: 6 })}
          </div>
          <Progress value={66} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
