"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { RatingStars } from "@/components/shop/rating-stars";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyReviewsQuery } from "@/lib/queries/commerce";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatDate } from "@/lib/i18n/format";

export function ReviewsClient() {
  const { locale, t } = useI18n();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const reviewsQuery = useMyReviewsQuery(isAuthenticated && Boolean(user), {
    page: 1,
    size: 100,
    sort: "createdAt,desc",
  });
  const reviews = reviewsQuery.data?.result ?? [];
  const reviewCount = reviewsQuery.data?.meta.total ?? reviews.length;

  if (isAuthLoading) {
    return <ReviewsPageLoading />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-canvas text-ink flex min-h-[100dvh] items-center justify-center px-6 pt-[120px]">
        <p className="text-sm font-medium tracking-wider text-[#1c1a18]/60 uppercase">
          {t("reviews.signIn")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        <section className="flex flex-col gap-6 text-left">
          <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
            <h2 className="font-serif text-2xl font-light tracking-tight text-[#1c1a18] md:text-3xl">
              {t("reviews.title")}
            </h2>
            <span className="text-xs text-[#55423d]/65">
              {t("reviews.count", { count: reviewCount })}
            </span>
          </div>

          {reviewsQuery.isError && reviews.length === 0 ? (
            <StorefrontApiStatus
              error={reviewsQuery.error}
              onRetry={() => void reviewsQuery.refetch()}
              resourceLabel={t("reviews.resource")}
              returnHref="/collection"
              variant="route"
            />
          ) : reviewsQuery.isLoading ? (
            <ReviewsLoadingSkeleton />
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-[#1c1a18]/5 bg-white py-24 text-center shadow-sm">
              <MessageSquare className="mb-6 h-12 w-12 text-[#1c1a18]/20" strokeWidth={1} />
              <h2 className="mb-3 font-serif text-2xl font-light text-[#1c1a18]">
                {t("reviews.emptyTitle")}
              </h2>
              <p className="mx-auto max-w-md text-sm text-[#1c1a18]/60">
                {t("reviews.emptyDescription")}
              </p>
              <Link
                href="/"
                className="mt-8 rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-[#b5573a]"
              >
                {t("reviews.shopNow")}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {reviewsQuery.isError ? (
                <StorefrontStaleWarning
                  onRetry={() => void reviewsQuery.refetch()}
                  resourceLabel={t("reviews.resource")}
                  error={reviewsQuery.error}
                />
              ) : null}
              {reviews.map((review) => (
                <Link
                  key={review.id}
                  href={
                    review.productSlug
                      ? `/products/${encodeURIComponent(review.productSlug)}?reviews=1#reviews`
                      : "/collection"
                  }
                  aria-label={t("reviews.viewProduct", { product: review.productName })}
                  className="flex flex-col gap-8 rounded-md border border-[#1c1a18]/10 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b5573a]/35 hover:shadow-md md:flex-row md:items-start"
                >
                  <div className="flex flex-shrink-0 flex-col gap-4 md:w-1/3">
                    <div>
                      <h3 className="font-serif text-xl font-light text-[#1c1a18]">
                        {review.productName}
                      </h3>
                      <p className="mt-1 text-xs tracking-widest text-[#1c1a18]/50 uppercase">
                        {t("reviews.order")}:{" "}
                        <span className="font-numeric">{review.orderCode}</span>
                      </p>
                    </div>
                    <RatingStars rating={review.rating ?? 0} sizeClassName="size-5" />
                    <p className="text-[11px] font-medium text-[#1c1a18]/40">
                      {review.createdAt ? formatDate(review.createdAt, locale) : ""}
                    </p>
                  </div>

                  <div className="md:w-2/3 md:border-l md:border-[#1c1a18]/10 md:pl-8">
                    <p className="text-[15px] leading-relaxed font-light text-[#1c1a18]/80">
                      {review.comment || (
                        <span className="text-[#1c1a18]/40 italic">{t("reviews.noComment")}</span>
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

function ReviewsPageLoading() {
  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col" aria-busy="true">
      <main className="flex w-full flex-grow flex-col gap-10 px-6 py-8 md:px-16 md:py-12">
        <section className="flex flex-col gap-6 text-left" aria-hidden="true">
          <div className="flex items-end justify-between border-b border-[#1c1a18]/10 pb-4">
            <Skeleton className="h-8 w-40 bg-[#efe7dc] md:h-9 md:w-52" />
            <Skeleton className="h-3 w-16 bg-[#efe7dc]" />
          </div>
          <ReviewsLoadingSkeleton />
        </section>
      </main>
    </div>
  );
}

function ReviewsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <article
          key={index}
          className="grid min-h-44 grid-cols-1 gap-8 rounded-md border border-[#1c1a18]/10 bg-white p-8 md:grid-cols-3"
        >
          <div className="space-y-4">
            <Skeleton className="h-6 w-4/5 bg-[#efe7dc]" />
            <Skeleton className="h-3 w-32 bg-[#efe7dc]" />
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Skeleton key={starIndex} className="size-5 rounded-full bg-[#efe7dc]" />
              ))}
            </div>
            <Skeleton className="h-2.5 w-20 bg-[#efe7dc]" />
          </div>
          <div className="space-y-3 md:col-span-2 md:border-l md:border-[#1c1a18]/10 md:pl-8">
            <Skeleton className="h-3.5 w-full bg-[#efe7dc]" />
            <Skeleton className="h-3.5 w-11/12 bg-[#efe7dc]" />
            <Skeleton className="h-3.5 w-3/5 bg-[#efe7dc]" />
          </div>
        </article>
      ))}
    </div>
  );
}
