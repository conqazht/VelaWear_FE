"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, MessageSquare, Star } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CustomerReviewSummary } from "@/lib/api/admin-dashboard";
import { formatNumber } from "@/lib/i18n/format";

type CustomerReviewsProps = {
  customerReviews?: CustomerReviewSummary;
};

export const CustomerReviews = React.memo(function CustomerReviews({
  customerReviews,
}: CustomerReviewsProps) {
  const { locale, t } = useI18n();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const averageRating = customerReviews?.averageRating ?? 5.0;
  const totalReviews = customerReviews?.totalReviews ?? 0;
  const recentReviews = customerReviews?.recentReviews ?? [];

  const currentReview = recentReviews[currentIndex];

  const handlePrev = () => {
    if (recentReviews.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : recentReviews.length - 1));
  };

  const handleNext = () => {
    if (recentReviews.length <= 1) return;
    setCurrentIndex((prev) => (prev < recentReviews.length - 1 ? prev + 1 : 0));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-normal">
          {t("admin.dashboardsA.ecommerce.reviews")}
        </CardTitle>
        <CardDescription className="text-foreground text-xl leading-none font-bold tracking-tight tabular-nums">
          {t("admin.dashboardsA.ecommerce.averageRating", { rating: averageRating.toFixed(1) })}
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="size-4 fill-current" />
            <span className="text-foreground text-sm font-bold">{averageRating.toFixed(1)}/5</span>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {currentReview ? (
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < (currentReview.rating || 5)
                          ? "fill-current"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <div className="text-foreground truncate text-sm font-semibold">
                    {currentReview.customerName}
                  </div>
                  {currentReview.productName ? (
                    <p className="text-muted-foreground truncate text-xs">
                      {currentReview.productName}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-2 line-clamp-3 min-h-[4em] text-xs leading-relaxed italic">
                    &ldquo;
                    {currentReview.comment ||
                      (locale === "vi"
                        ? "Đánh giá chất lượng sản phẩm tốt!"
                        : "Great product quality!")}
                    &rdquo;
                  </p>
                </div>
              </div>

              {recentReviews.length > 1 ? (
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    aria-label={t("admin.dashboardsA.ecommerce.previousReview")}
                    size="icon-xs"
                    variant="outline"
                    onClick={handlePrev}
                  >
                    <ArrowLeft className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    aria-label={t("admin.dashboardsA.ecommerce.nextReview")}
                    size="icon-xs"
                    variant="outline"
                    onClick={handleNext}
                  >
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="bg-muted/20 text-muted-foreground flex h-32 flex-col items-center justify-center gap-2 rounded-lg border text-center text-xs">
            <MessageSquare className="text-muted-foreground/50 size-5" />
            <p>
              {locale === "vi" ? "Chưa có đánh giá nào từ khách hàng" : "No customer reviews yet"}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border px-4 py-3 text-xs">
          <div>
            <span className="text-foreground text-sm font-semibold">
              {formatNumber(totalReviews, locale)}
            </span>
            <span className="text-muted-foreground ml-1.5">
              {locale === "vi" ? "tổng lượt đánh giá đã nhận" : "total reviews received"}
            </span>
          </div>
          <span className="text-muted-foreground">
            {locale === "vi" ? "Toàn thời gian" : "All time"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});
