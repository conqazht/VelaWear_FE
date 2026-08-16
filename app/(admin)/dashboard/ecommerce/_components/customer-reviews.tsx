"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIntlLocale } from "@/lib/i18n";

const customerInitials = ["EM", "OW", "NO", "MM"] as const;

export function CustomerReviews() {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const compactFormatter = new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 1,
    notation: "compact",
  });
  const numberFormatter = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 1 });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-normal">
          {t("admin.dashboardsA.ecommerce.reviews")}
        </CardTitle>
        <CardDescription className="text-foreground text-xl leading-none tracking-tight tabular-nums">
          {t("admin.dashboardsA.ecommerce.averageRating", { rating: numberFormatter.format(4.6) })}
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="text-foreground flex gap-0.5">
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
              </div>
              <div>
                <div className="text-sm font-medium">Melody Macy</div>
                <p className="text-muted-foreground mt-2 line-clamp-3 min-h-[4.5em] text-sm">
                  The linen overshirt arrived faster than expected and the fit was exactly right.
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                aria-label={t("admin.dashboardsA.ecommerce.previousReview")}
                size="icon-xs"
                variant="outline"
              >
                <ArrowLeft />
              </Button>
              <Button
                aria-label={t("admin.dashboardsA.ecommerce.nextReview")}
                size="icon-xs"
                variant="outline"
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">
              {t("admin.dashboardsA.ecommerce.reviewCount", {
                count: compactFormatter.format(12_800),
              })}
            </div>
            <div className="text-muted-foreground line-clamp-2 min-h-[3em] text-xs">
              {t("admin.dashboardsA.ecommerce.reviewedThisMonth")}
            </div>
          </div>

          <AvatarGroup>
            {customerInitials.map((initials) => (
              <Avatar key={initials}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}

            <AvatarGroupCount>+{numberFormatter.format(42)}</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </CardContent>
    </Card>
  );
}
