"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Star, X } from "lucide-react";

import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useI18n } from "@/components/providers/i18n-provider";
import { RatingStars } from "@/components/shop/rating-stars";
import { ReviewComment } from "@/components/shop/review-comment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/i18n/format";
import { useProductReviewSummaryQuery, useProductReviewsQuery } from "@/lib/queries/catalog";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/vela-data";

export type ProductReviewSort = "newest" | "oldest" | "rating-high" | "rating-low";

export type ProductReviewViewState = {
  rating?: number;
  sort: ProductReviewSort;
  page: number;
};

type ProductReviewsDialogProps = {
  productId: number;
  productName: string;
  open: boolean;
  state: ProductReviewViewState;
  onOpenChange: (open: boolean) => void;
  onStateChange: (state: ProductReviewViewState) => void;
};

export function ProductReviewsDialog({
  productId,
  productName,
  open,
  state,
  onOpenChange,
  onStateChange,
}: ProductReviewsDialogProps) {
  const { locale, t } = useI18n();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const reviewsQuery = useProductReviewsQuery(
    {
      productId,
      rating: state.rating,
      sort: state.sort,
      page: state.page,
      size: 10,
    },
    { enabled: open },
  );
  const summaryQuery = useProductReviewSummaryQuery(productId);
  const reviews = reviewsQuery.data?.result ?? [];
  const meta = reviewsQuery.data?.meta;
  const summary = summaryQuery.data;
  const pages = Math.max(meta?.pages ?? 1, 1);

  useEffect(() => {
    if (meta && state.page > pages) {
      onStateChange({ ...state, page: pages });
    }
  }, [meta, onStateChange, pages, state]);

  const visiblePages = useMemo(() => {
    const start = Math.max(1, Math.min(state.page - 2, pages - 4));
    const end = Math.min(pages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [pages, state.page]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            if (lightboxImage) {
              setLightboxImage(null);
              return;
            }
          }
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="bg-canvas h-[92dvh] max-h-[920px] w-[calc(100%-1rem)] max-w-[1180px] overflow-hidden rounded-lg p-0 shadow-2xl sm:max-w-[1180px]">
          <div className="grid h-full min-h-0 grid-rows-[auto_1fr]">
            <DialogHeader className="border-b border-[#1c1a18]/10 bg-white px-5 py-5 pr-14 text-left md:px-10 md:py-6">
              <DialogTitle className="text-ink font-serif text-2xl font-light tracking-tight md:text-3xl">
                {t("reviews.allTitle", { product: productName })}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-[#55423d]/70">
                {t("reviews.allDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid min-h-0 overflow-y-auto lg:grid-cols-[300px_1fr] lg:overflow-hidden">
              {/* Left Sidebar: Rating Summary & Unified Interactive Filter */}
              <aside className="border-b border-[#1c1a18]/10 bg-[#efe7dc]/55 p-5 md:p-7 lg:overflow-y-auto lg:border-r lg:border-b-0">
                {summaryQuery.isLoading ? (
                  <ReviewSummarySkeleton />
                ) : summaryQuery.isError && !summary ? (
                  <StorefrontApiStatus
                    error={summaryQuery.error}
                    onRetry={() => void summaryQuery.refetch()}
                    resourceLabel={t("reviews.summaryResource")}
                    variant="panel"
                  />
                ) : summary ? (
                  <>
                    {summaryQuery.isError ? (
                      <StorefrontStaleWarning
                        onRetry={() => void summaryQuery.refetch()}
                        resourceLabel={t("reviews.summaryResource")}
                        error={summaryQuery.error}
                        className="mb-4"
                      />
                    ) : null}
                    <div className="flex items-baseline gap-3">
                      <strong className="text-ink font-serif text-5xl font-light tabular-nums md:text-6xl">
                        {Number(summary.averageRating ?? 0).toFixed(1)}
                      </strong>
                      <span className="text-sm font-medium text-[#55423d]/60">/ 5.0</span>
                    </div>
                    <RatingStars
                      rating={summary.averageRating ?? 0}
                      className="mt-2.5"
                      sizeClassName="size-4"
                      activeClassName="text-[#b5573a]"
                    />
                    <p className="mt-2 text-xs font-medium tracking-[0.14em] text-[#55423d]/65 uppercase">
                      {t("reviews.total", { count: summary.total })}
                    </p>

                    <div className="mt-7 space-y-2" aria-label={t("reviews.distribution")}>
                      {/* All Ratings Option */}
                      <button
                        type="button"
                        onClick={() => onStateChange({ ...state, rating: undefined, page: 1 })}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-sm border px-3 py-2 text-left text-xs transition-all",
                          state.rating === undefined
                            ? "text-ink border-[#1c1a18]/30 bg-white font-semibold shadow-xs ring-1 ring-[#1c1a18]/20"
                            : "border-transparent bg-transparent text-[#55423d]/80 hover:bg-white/60",
                        )}
                        aria-pressed={state.rating === undefined}
                      >
                        <span className="font-medium">{t("reviews.filterAll")}</span>
                        <span className="text-[#55423d]/65 tabular-nums">{summary.total}</span>
                      </button>

                      {/* 5 to 1 Star Breakdown Filter Rows */}
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count =
                          summary.ratingCounts[String(rating) as "1" | "2" | "3" | "4" | "5"] ?? 0;
                        const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
                        const selected = state.rating === rating;
                        return (
                          <button
                            key={rating}
                            type="button"
                            className={cn(
                              "grid w-full cursor-pointer grid-cols-[40px_1fr_28px] items-center gap-2.5 rounded-sm border px-3 py-2 text-left text-xs transition-all",
                              selected
                                ? "text-ink ring-1.5 border-[#b5573a] bg-white font-semibold shadow-xs ring-[#b5573a]"
                                : "border-transparent bg-transparent text-[#55423d]/80 hover:bg-white/60",
                            )}
                            aria-pressed={selected}
                            onClick={() =>
                              onStateChange({
                                ...state,
                                rating: selected ? undefined : rating,
                                page: 1,
                              })
                            }
                          >
                            <span className="inline-flex items-center gap-1 font-medium">
                              {rating} <Star className="size-3 fill-[#b5573a] text-[#b5573a]" />
                            </span>
                            <span className="h-1.5 overflow-hidden rounded-full bg-[#1c1a18]/10">
                              <span
                                className="block h-full rounded-full bg-[#b5573a] transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </span>
                            <span className="text-right text-[#55423d]/65 tabular-nums">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </aside>

              {/* Right Content: Filter Status Header + Review List + Pagination */}
              <section className="flex min-h-0 flex-col bg-white">
                <div className="flex flex-col gap-3 border-b border-[#1c1a18]/10 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-8">
                  {/* Left: Active Filter Status */}
                  <div>
                    {state.rating !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1c1a18]">
                          {t("reviews.filterActive", { rating: state.rating })}
                        </span>
                        <button
                          type="button"
                          onClick={() => onStateChange({ ...state, rating: undefined, page: 1 })}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#1c1a18]/15 bg-white px-3.5 py-1 text-xs font-semibold text-[#1c1a18] shadow-2xs transition-colors hover:bg-[#efe7dc] active:scale-[0.96]"
                        >
                          <X className="size-3" />
                          <span>{t("reviews.clearFilter")}</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium tracking-[0.1em] text-[#55423d]/65 uppercase">
                        {t("reviews.total", {
                          count: summary?.total ?? meta?.total ?? reviews.length,
                        })}
                      </span>
                    )}
                  </div>

                  {/* Right: Shadcn Sort Select */}
                  <div className="flex items-center gap-2.5">
                    <span className="shrink-0 text-xs font-medium tracking-[0.1em] text-[#55423d]/60 uppercase">
                      {t("reviews.sortLabel")}
                    </span>
                    <Select
                      value={state.sort}
                      onValueChange={(value) =>
                        onStateChange({
                          ...state,
                          sort: value as ProductReviewSort,
                          page: 1,
                        })
                      }
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-8.5 w-40 cursor-pointer rounded-sm border border-[#1c1a18]/20 bg-white px-3 text-xs font-medium text-[#1c1a18] shadow-xs transition-colors hover:border-[#1c1a18]/40 sm:w-44"
                      >
                        <span className="truncate">
                          {{
                            newest: t("reviews.sortNewest"),
                            oldest: t("reviews.sortOldest"),
                            "rating-high": t("reviews.sortHigh"),
                            "rating-low": t("reviews.sortLow"),
                          }[state.sort] ?? t("reviews.sortNewest")}
                        </span>
                      </SelectTrigger>
                      <SelectContent
                        align="end"
                        alignItemWithTrigger={false}
                        className="w-(--anchor-width) min-w-(--anchor-width) overflow-hidden rounded-sm border border-[#1c1a18]/20 bg-white p-0 shadow-lg"
                      >
                        <SelectItem
                          value="newest"
                          className="focus:text-ink cursor-pointer rounded-none py-2 pr-7 pl-3.5 text-xs transition-colors hover:bg-[#efe7dc] focus:bg-[#efe7dc]"
                        >
                          {t("reviews.sortNewest")}
                        </SelectItem>
                        <SelectItem
                          value="oldest"
                          className="focus:text-ink cursor-pointer rounded-none border-t border-[#1c1a18]/8 py-2 pr-7 pl-3.5 text-xs transition-colors hover:bg-[#efe7dc] focus:bg-[#efe7dc]"
                        >
                          {t("reviews.sortOldest")}
                        </SelectItem>
                        <SelectItem
                          value="rating-high"
                          className="focus:text-ink cursor-pointer rounded-none border-t border-[#1c1a18]/8 py-2 pr-7 pl-3.5 text-xs transition-colors hover:bg-[#efe7dc] focus:bg-[#efe7dc]"
                        >
                          {t("reviews.sortHigh")}
                        </SelectItem>
                        <SelectItem
                          value="rating-low"
                          className="focus:text-ink cursor-pointer rounded-none border-t border-[#1c1a18]/8 py-2 pr-7 pl-3.5 text-xs transition-colors hover:bg-[#efe7dc] focus:bg-[#efe7dc]"
                        >
                          {t("reviews.sortLow")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 md:px-8">
                  {reviewsQuery.isLoading && !reviewsQuery.data ? (
                    <ReviewsListSkeleton />
                  ) : reviewsQuery.isError && reviews.length === 0 ? (
                    <div className="py-8">
                      <StorefrontApiStatus
                        error={reviewsQuery.error}
                        onRetry={() => void reviewsQuery.refetch()}
                        resourceLabel={t("reviews.resource")}
                        variant="panel"
                      />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-sm text-[#1c1a18]/55">
                        {state.rating
                          ? t("reviews.emptyForRating", { rating: state.rating })
                          : t("reviews.emptyTitle")}
                      </p>
                      {state.rating !== undefined && (
                        <button
                          type="button"
                          onClick={() => onStateChange({ ...state, rating: undefined, page: 1 })}
                          className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#b5573a] hover:underline"
                        >
                          {t("reviews.clearFilter")}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {reviewsQuery.isError ? (
                        <div className="pt-5">
                          <StorefrontStaleWarning
                            onRetry={() => void reviewsQuery.refetch()}
                            resourceLabel={t("reviews.resource")}
                            error={reviewsQuery.error}
                          />
                        </div>
                      ) : null}
                      <div className="divide-y divide-[#1c1a18]/10">
                        {reviews.map((review) => (
                          <article key={review.id} id={`review-${review.id}`} className="py-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-[#1c1a18]">{review.userName}</p>
                                <p className="mt-1 text-xs text-[#1c1a18]/45">
                                  {review.createdAt ? formatDate(review.createdAt, locale) : ""}
                                  {review.verifiedPurchase ? ` · ${t("reviews.verified")}` : ""}
                                </p>
                              </div>
                              <RatingStars rating={review.rating ?? 0} sizeClassName="size-4" />
                            </div>
                            {review.variantName ? (
                              <p className="mt-2.5 text-xs font-medium tracking-[0.12em] text-[#1c1a18]/45 uppercase">
                                {review.variantName}
                              </p>
                            ) : null}
                            <ReviewComment comment={review.comment} className="mt-3" />
                            {review.images?.length ? (
                              <div className="mt-4 flex flex-wrap gap-3">
                                {review.images.map((image, index) => {
                                  const resolvedImage = resolveImageUrl(image);
                                  return (
                                    <button
                                      type="button"
                                      key={`${image}-${index}`}
                                      className="relative size-20 cursor-pointer overflow-hidden rounded-sm border border-[#1c1a18]/10 bg-[#f7f4ef] focus-visible:outline-2 focus-visible:outline-offset-2"
                                      onClick={() => setLightboxImage(resolvedImage)}
                                      aria-label={t("reviews.openImage", { index: index + 1 })}
                                    >
                                      <Image
                                        src={resolvedImage}
                                        alt=""
                                        fill
                                        unoptimized
                                        sizes="80px"
                                        className="object-cover transition-transform hover:scale-105"
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Pagination footer */}
                <div className="flex items-center justify-between gap-3 border-t border-[#1c1a18]/10 px-5 py-4 md:px-8">
                  <span className="text-xs text-[#1c1a18]/50">
                    {t("reviews.page", { page: state.page, pages })}
                  </span>
                  <nav
                    className="flex items-center gap-1"
                    aria-label={t("reviews.paginationLabel")}
                  >
                    <button
                      type="button"
                      disabled={state.page <= 1 || reviewsQuery.isFetching}
                      onClick={() => onStateChange({ ...state, page: state.page - 1 })}
                      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-sm border border-[#1c1a18]/10 transition-colors hover:bg-[#f7f4ef] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label={t("reviews.previous")}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => onStateChange({ ...state, page })}
                        aria-current={page === state.page ? "page" : undefined}
                        className={cn(
                          "size-9 cursor-pointer rounded-sm border text-xs tabular-nums transition-colors",
                          page === state.page
                            ? "border-[#1c1a18] bg-[#1c1a18] font-medium text-white"
                            : "border-[#1c1a18]/10 hover:bg-[#f7f4ef]",
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={state.page >= pages || reviewsQuery.isFetching}
                      onClick={() => onStateChange({ ...state, page: state.page + 1 })}
                      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-sm border border-[#1c1a18]/10 transition-colors hover:bg-[#f7f4ef] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label={t("reviews.next")}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </nav>
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(lightboxImage)}
        onOpenChange={(nextOpen) => !nextOpen && setLightboxImage(null)}
      >
        <DialogContent
          className="h-[90dvh] max-w-[min(96vw,1100px)] overflow-hidden bg-black p-4 sm:max-w-[min(96vw,1100px)]"
          showCloseButton
        >
          <DialogTitle className="sr-only">{t("reviews.imageTitle")}</DialogTitle>
          <DialogDescription className="sr-only">{t("reviews.imageDescription")}</DialogDescription>
          {lightboxImage ? (
            <div className="relative h-full w-full">
              <Image
                src={lightboxImage}
                alt={t("reviews.imageAlt")}
                fill
                unoptimized
                sizes="96vw"
                className="object-contain"
              />
            </div>
          ) : (
            <ImageIcon className="m-auto size-12 text-white/50" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReviewSummarySkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-14 w-24 bg-[#efe7dc]" />
      <Skeleton className="h-4 w-32 bg-[#efe7dc]" />
      <Skeleton className="h-3 w-20 bg-[#efe7dc]" />
      <div className="space-y-2.5 pt-5">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full bg-[#efe7dc]" />
        ))}
      </div>
    </div>
  );
}

function ReviewsListSkeleton() {
  return (
    <div className="divide-y divide-[#1c1a18]/10" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-3 py-6">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28 bg-[#efe7dc]" />
            <Skeleton className="h-4 w-24 bg-[#efe7dc]" />
          </div>
          <Skeleton className="h-3 w-20 bg-[#efe7dc]" />
          <Skeleton className="h-4 w-full bg-[#efe7dc]" />
          <Skeleton className="h-4 w-3/4 bg-[#efe7dc]" />
        </div>
      ))}
    </div>
  );
}
