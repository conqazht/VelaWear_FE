"use client";

import type { ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/lib/i18n";

type ContentLocaleTabsProps = {
  value: Locale;
  onValueChange: (locale: Locale) => void;
  complete: Record<Locale, boolean>;
  children: Record<Locale, ReactNode>;
};

const LOCALES: Locale[] = ["vi", "en"];

export function ContentLocaleTabs({
  value,
  onValueChange,
  complete,
  children,
}: ContentLocaleTabsProps) {
  const { t } = useI18n();

  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as Locale)} className="gap-4">
      <TabsList variant="line" className="w-full justify-start">
        {LOCALES.map((locale) => (
          <TabsTrigger key={locale} value={locale} className="gap-2">
            {locale === "vi"
              ? t("admin.commerce.translation.vietnamese")
              : t("admin.commerce.translation.english")}
            <Badge
              variant={complete[locale] ? "secondary" : "outline"}
              className="gap-1 px-1.5 py-0 text-[10px]"
            >
              {complete[locale] ? <CircleCheck className="size-3" /> : <CircleAlert className="size-3" />}
              {complete[locale]
                ? t("admin.commerce.translation.complete")
                : t("admin.commerce.translation.missing")}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {LOCALES.map((locale) => (
        <TabsContent key={locale} value={locale} className="grid gap-5">
          {children[locale]}
        </TabsContent>
      ))}

      {!complete.vi ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{t("admin.commerce.translation.viRequired")}</AlertDescription>
        </Alert>
      ) : !complete.en ? (
        <Alert>
          <CircleAlert />
          <AlertDescription>{t("admin.commerce.translation.enOptional")}</AlertDescription>
        </Alert>
      ) : null}
    </Tabs>
  );
}
