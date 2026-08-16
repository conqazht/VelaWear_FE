"use client";

import { addDays, set } from "date-fns";
import { ChevronRight, Zap } from "lucide-react";
import { siClaude, siLinear, siResend } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { useI18n } from "@/components/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatCurrency, formatDate } from "@/lib/i18n/format";

const transactions = [
  {
    id: 1,
    titleKey: "admin.finance.bills.claude",
    date: set(addDays(new Date("2024-04-15T12:00:00Z"), 2), { hours: 14, minutes: 45 }),
    icon: siClaude,
  },
  {
    id: 2,
    titleKey: "admin.finance.bills.resend",
    date: set(addDays(new Date("2024-04-15T12:00:00Z"), 4), { hours: 7, minutes: 0 }),
    icon: siResend,
  },
  {
    id: 3,
    titleKey: "admin.finance.bills.linear",
    date: set(addDays(new Date("2024-04-15T12:00:00Z"), 10), { hours: 7, minutes: 0 }),
    icon: siLinear,
  },
] as const;

export function UpcomingTransactions() {
  const { locale, t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t("admin.finance.bills.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="flex items-baseline text-3xl leading-none tracking-tight">
              <span className="font-normal">{formatCurrency(1245, locale, "USD")}</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-none">
              {t("admin.finance.bills.due", { count: transactions.length })}
            </p>
          </div>
          <div className="border-border bg-muted/70 flex w-max items-center gap-2 rounded-md border px-2 py-1.5 text-sm">
            <Zap className="fill-primary text-primary size-4" aria-hidden="true" />
            <span className="text-muted-foreground">
              {t("admin.finance.bills.autopay", { amount: formatCurrency(145, locale, "USD") })}
            </span>
          </div>
        </div>

        <ItemGroup>
          {transactions.map((transaction) => (
            <Item key={transaction.id} variant="outline" size="xs">
              <ItemMedia>
                <div className="bg-background grid size-9 place-items-center rounded-md border">
                  <SimpleIcon icon={transaction.icon} />
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{t(transaction.titleKey)}</ItemTitle>
                <ItemDescription>
                  {formatDate(transaction.date, locale, { dateStyle: "long", timeStyle: "short" })}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="text-muted-foreground size-5" />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
