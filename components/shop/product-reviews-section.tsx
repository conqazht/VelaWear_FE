"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

import { StorefrontStaleWarning } from "@/components/errors/storefront-stale-warning";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  ProductReviewsDialog,
  type ProductReviewSort,
  type ProductReviewViewState,
} from "@/components/shop/product-reviews-dialog";
import { RatingStars } from "@/components/shop/rating-stars";
import { ReviewComment } from "@/components/shop/review-comment";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/i18n/format";
import {
  useProductReviewSummaryQuery,
  useProductReviewsQuery,
} from "@/lib/queries/catalog";

type ProductReviewsSectionProps = {
  productId?: number;
  productName: string;
};

const reviewSorts = new Set<ProductReviewSort>([
  "newest",
  "oldest",
  "rating-high",
  "rating-low",
]);

function readReviewUrlState(): { open: boolean; view: ProductReviewViewState } {
  if (typeof window === "undefined") {
    return { open: false, view: { sort: "newest", page: 1 } };
  }
  const params = new URLSearchParams(window.location.search);
  const parsedRating = Number(params.get("reviewRating"));
  const parsedPage = Number(params.get("reviewPage"));
  const parsedSort = params.get("reviewSort") as ProductReviewSort | null;
  return {
    open: params.get("reviews") === "1" || window.location.hash === "#reviews",
    view: {
      rating: Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : undefined,
      sort: parsedSort && reviewSorts.has(parsedSort) ? parsedSort : "newest",
      page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    },
  };
}

function updateReviewUrl(open: boolean, view: ProductReviewViewState, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  if (open) {
    url.searchParams.set("reviews", "1");
    if (view.rating) url.searchParams.set("reviewRating", String(view.rating));
    else url.searchParams.delete("reviewRating");
    if (view.sort !== "newest") url.searchParams.set("reviewSort", view.sort);
    else url.searchParams.delete("reviewSort");
    if (view.page > 1) url.searchParams.set("reviewPage", String(view.page));
    else url.searchParams.delete("reviewPage");
    url.hash = "reviews";
  } else {
    url.searchParams.delete("reviews");
    url.searchParams.delete("reviewRating");
    url.searchParams.delete("reviewSort");
    url.searchParams.delete("reviewPage");
    if (url.hash === "#reviews") url.hash = "";
  }
  window.history[mode === "push" ? "pushState" : "replaceState"](
    { ...window.history.state, velaReviews: open },
    "",
    url,
  );
}

export function ProductReviewsSection({
  productId,
  productName,
}: ProductReviewsSectionProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ProductReviewViewState>({ sort: "newest", page: 1 });
  const pushedOpenRef = useRef(false);
  const previewQuery = useProductReviewsQuery({
    productId,
    page: 1,
    size: 3,
    sort: "newest",
  });
  const summaryQuery = useProductReviewSummaryQuery(productId);
  const reviews = previewQuery.data?.result ?? [];
  const count = summaryQuery.data?.total ?? previewQuery.data?.meta.total ?? 0;
  const average = summaryQuery.data?.averageRating ?? 0;

  useEffect(() => {
    const syncFromUrl = () => {
      const next = readReviewUrlState();
      setOpen(next.open);
      setView(next.view);
      pushedOpenRef.current = false;
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen === open) return;
    if (nextOpen) {
      pushedOpenRef.current = true;
      updateReviewUrl(true, view, "push");
      setOpen(true);
      return;
    }
    if (pushedOpenRef.current) {
      pushedOpenRef.current = false;
      window.history.back();
    } else {
      updateReviewUrl(false, view, "replace");
      setOpen(false);
    }
  }, [open, view]);

  const handleStateChange = useCallback((nextView: ProductReviewViewState) => {
    setView(nextView);
    updateReviewUrl(true, nextView, "replace");
  }, []);

  if (!productId) return null;

  return (
    <section id="reviews" className="scroll-mt-32 border-b border-hairline/40 py-7">
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex w-full items-center justify-between gap-5 text-left focus-visible:outline-2 focus-visible:outline-offset-4"
        aria-haspopup="dialog"
      >
        <div>
          <h2 className="font-serif text-xl font-light text-[#1c1a18] md:text-2xl">
            {t("storefront.product.reviews", { count })}
          </h2>
          {count > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RatingStars rating={average} sizeClassName="size-4" activeClassName="text-[#b85a3c]" />
              <span className="text-xs text-[#1c1a18]/55">
                {average.toFixed(1)} · {t("reviews.total", { count })}
              </span>
            </div>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#b85a3c]">
          {t("reviews.viewAll", { count })}<ChevronRight className="size-4" />
        </span>
      </button>

      {previewQuery.isLoading && !previewQuery.data ? (
        <div className="mt-6 space-y-6" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-3 border-t border-[#1c1a18]/10 pt-5">
              <div className="flex justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-24" /></div>
              <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : previewQuery.isError && reviews.length === 0 ? (
        <div className="mt-5 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("storefront.product.reviewError")}
          <button type="button" onClick={() => void previewQuery.refetch()} className="ml-2 font-semibold underline underline-offset-4">
            {t("errors.common.retry")}
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-5 text-sm text-[#1c1a18]/55">{t("storefront.product.noReviews")}</p>
      ) : (
        <>
          {previewQuery.isError ? (
            <div className="mt-5">
              <StorefrontStaleWarning onRetry={() => void previewQuery.refetch()} resourceLabel={t("reviews.resource")} />
            </div>
          ) : null}
          <div className="mt-6 divide-y divide-[#1c1a18]/10">
            {reviews.slice(0, 3).map((review) => (
              <article key={review.id} className="py-5 first:pt-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1c1a18]">{review.userName}</p>
                    <p className="mt-1 text-xs text-[#1c1a18]/45">
                      {review.createdAt ? formatDate(review.createdAt, locale) : ""}
                    </p>
                  </div>
                  <RatingStars rating={review.rating ?? 0} sizeClassName="size-4" />
                </div>
                <ReviewComment comment={review.comment} clamp className="mt-3" />
              </article>
            ))}
          </div>
        </>
      )}

      <ProductReviewsDialog
        productId={productId}
        productName={productName}
        open={open}
        state={view}
        onOpenChange={handleOpenChange}
        onStateChange={handleStateChange}
      />
    </section>
  );
}
