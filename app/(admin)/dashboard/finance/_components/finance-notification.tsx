"use client";

import { TrendingUp } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export function FinanceNotification() {
  const { t } = useI18n();

  return (
    <Item className="rounded-xl" variant="outline">
      <ItemMedia variant="icon">
        <TrendingUp />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{t("admin.finance.credit.title")}</ItemTitle>
        <ItemDescription>
          {t("admin.finance.credit.description", { points: 14, score: 782 })}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          {t("admin.finance.credit.view")}
        </Button>
      </ItemActions>
    </Item>
  );
}
