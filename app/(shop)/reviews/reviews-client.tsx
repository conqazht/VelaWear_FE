"use client";

import Link from "next/link";
import { Skeleton } from "boneyard-js/react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { RatingStars } from "@/components/shop/rating-stars";
import { useReviewsByUserQuery } from "@/lib/queries/commerce";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatDate } from "@/lib/i18n/format";

export function ReviewsClient() {
  const { locale, t } = useI18n();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;
  const reviewsQuery = useReviewsByUserQuery(userId, {
    size: 100,
    sort: "createdAt,desc",
  });
  const reviews = reviewsQuery.data?.result ?? [];

  if (!isAuthenticated || !user) {
    return (
      <Skeleton name="reviews-page" loading={isAuthLoading} fallback={<ReviewsLoadingFallback />} fixture={<ReviewsLoadingFixture />}>
      <div className="bg-canvas text-ink min-h-[100dvh] pt-[120px] px-6 flex items-center justify-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[#1c1a18]/60">{t("reviews.signIn")}</p>
      </div>
      </Skeleton>
    );
  }

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      <main className="flex-grow w-full px-6 md:px-16 py-10 md:py-16 flex flex-col gap-10">
        <section className="flex flex-col gap-6 text-left">
          <div className="border-b border-[#1c1a18]/10 pb-4 flex justify-between items-end">
            <h2 className="font-serif text-2xl md:text-3xl text-[#1c1a18] font-light tracking-tight">
              {t("reviews.title")}
            </h2>
            <span className="text-xs text-[#55423d]/65">
              {t("reviews.count", { count: reviews.length })}
            </span>
          </div>

        {reviewsQuery.isError ? (
          <StorefrontApiStatus
            error={reviewsQuery.error}
            onRetry={() => void reviewsQuery.refetch()}
            resourceLabel={t("reviews.resource")}
            returnHref="/collection"
            variant="panel"
          />
        ) : reviewsQuery.isLoading ? (
          <Skeleton
            name="reviews-page"
            loading
            fallback={<ReviewsLoadingFallback />}
            fixture={<ReviewsLoadingFixture />}
          >
            <ReviewsLoadingFixture />
          </Skeleton>
        ) : reviews.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white border border-[#1c1a18]/5 rounded-md shadow-sm">
            <MessageSquare className="w-12 h-12 text-[#1c1a18]/20 mb-6" strokeWidth={1} />
            <h2 className="font-serif text-2xl text-[#1c1a18] font-light mb-3">{t("reviews.emptyTitle")}</h2>
            <p className="text-sm text-[#1c1a18]/60 max-w-md mx-auto">
              {t("reviews.emptyDescription")}
            </p>
            <Link href="/" className="mt-8 px-8 py-3.5 bg-[#1c1a18] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#b85a3c] transition-colors">
              {t("reviews.shopNow")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={review.productSlug
                  ? `/products/${encodeURIComponent(review.productSlug)}?review=${review.id}#reviews`
                  : "/collection"}
                aria-label={t("reviews.viewProduct", { product: review.productName })}
                className="bg-white border border-[#1c1a18]/10 rounded-md p-8 shadow-sm flex flex-col md:flex-row md:items-start gap-8 transition-all hover:-translate-y-0.5 hover:border-[#b85a3c]/35 hover:shadow-md"
              >
                <div className="md:w-1/3 flex-shrink-0 flex flex-col gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-light text-[#1c1a18]">
                      {review.productName}
                    </h3>
                    <p className="mt-1 text-xs text-[#1c1a18]/50 uppercase tracking-widest">
                      {t("reviews.order")}: <span className="font-numeric">{review.orderCode}</span>
                    </p>
                  </div>
                  <RatingStars rating={review.rating ?? 0} sizeClassName="size-5" />
                  <p className="text-[11px] text-[#1c1a18]/40 font-medium">
                    {review.createdAt ? formatDate(review.createdAt, locale) : ""}
                  </p>
                </div>

                <div className="md:w-2/3 md:border-l md:border-[#1c1a18]/10 md:pl-8">
                  <p className="text-[15px] leading-relaxed text-[#1c1a18]/80 font-light">
                    {review.comment || (
                      <span className="italic text-[#1c1a18]/40">{t("reviews.noComment")}</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        </section>
      </main>
    </div>
  );
}

function ReviewsLoadingFallback() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-44 rounded-md bg-white" />
      ))}
    </div>
  );
}

function ReviewsLoadingFixture() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={index} className="grid min-h-44 grid-cols-1 gap-8 rounded-md border border-[#1c1a18]/10 bg-white p-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="font-serif text-xl">{t("reviews.fixtureProduct")}</h3>
            <p className="text-xs uppercase tracking-widest">{t("reviews.order")} VW-0000</p>
          </div>
          <p className="md:col-span-2">{t("reviews.fixtureContent")}</p>
        </article>
      ))}
    </div>
  );
}
