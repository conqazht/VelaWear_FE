"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { FashionImage } from "@/components/shop/fashion-image";
import {
  ProductGrid,
  ProductLayoutMain,
  ProductToolbar,
  type SortOption,
} from "@/components/shop/product-layout-components";
import { ProductCard } from "@/components/shop/product-card";
import { ProductCardSkeletonGrid } from "@/components/shop/product-skeletons";
import { useI18n } from "@/components/providers/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import type { StorefrontCatalogResult, StorefrontCatalogSort } from "@/lib/api/types";
import { classifyApiError } from "@/lib/api/errors";
import { useStorefrontProductsQuery } from "@/lib/queries/catalog";
import { mapBackendProduct } from "@/lib/vela-data";
import {
  EMPTY_CATALOG_URL_STATE,
  catalogStateToApiFilters,
  getCatalogRollbackQuery,
  isValidCatalogPriceRange,
  parseCatalogUrlState,
  serializeCatalogUrlState,
  type CatalogUrlState,
} from "@/lib/storefront-catalog";
import {
  getCatalogCopy,
  type CatalogMode,
  type CatalogRollback,
} from "@/components/shop/collection/catalog-types";
import { CatalogFilters } from "@/components/shop/collection/catalog-filters";
import { ActiveFilters } from "@/components/shop/collection/active-filters";
import { CatalogPagination } from "@/components/shop/collection/catalog-pagination";

export type { CatalogMode, CatalogRollback };

export function CollectionClient({ mode = "collection" }: { mode?: CatalogMode }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const copy = getCatalogCopy(locale);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const lastSuccessfulQueryRef = useRef<string | null>(null);
  const [lastSuccessfulCatalog, setLastSuccessfulCatalog] = useState<{
    data: StorefrontCatalogResult;
    locale: "vi" | "en";
  } | null>(null);
  const [rollback, setRollback] = useState<CatalogRollback | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDraft, setMobileDraft] = useState<CatalogUrlState>(EMPTY_CATALOG_URL_STATE);
  const [priceError, setPriceError] = useState<string | null>(null);

  const state = useMemo(() => parseCatalogUrlState(searchParams), [searchParams]);
  const serializedState = serializeCatalogUrlState(state);
  const productsQuery = useStorefrontProductsQuery(catalogStateToApiFilters(state, locale));
  const mobilePreviewQuery = useStorefrontProductsQuery(
    catalogStateToApiFilters({ ...mobileDraft, page: 1 }, locale, 1),
    { enabled: mobileFiltersOpen && isValidCatalogPriceRange(mobileDraft) },
  );

  const catalogData =
    productsQuery.data ??
    (productsQuery.isError && lastSuccessfulCatalog?.locale === locale
      ? lastSuccessfulCatalog.data
      : undefined);
  const facets = catalogData?.facets ?? {
    categories: [],
    colors: [],
    sizes: [],
    priceRange: { min: null, max: null },
  };
  const products = useMemo(
    () => (catalogData?.result ?? []).map((product) => mapBackendProduct(product, locale)),
    [catalogData?.result, locale],
  );
  const meta = catalogData?.meta;
  const isInitialLoading = productsQuery.isPending && catalogData === undefined;
  const sortOptions: SortOption[] = [
    { value: "featured", label: t("storefront.catalog.sortFeatured") },
    { value: "newest", label: t("storefront.catalog.sortNewest") },
    { value: "price-asc", label: t("storefront.catalog.sortPriceLow") },
    { value: "price-desc", label: t("storefront.catalog.sortPriceHigh") },
  ];

  useEffect(() => {
    if (
      productsQuery.isSuccess &&
      !productsQuery.isPlaceholderData &&
      productsQuery.data !== undefined
    ) {
      lastSuccessfulQueryRef.current = serializedState;
      if (rollback?.query === serializedState) {
        // The retry reached a terminal success, so the rollback warning can close.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRollback(null);
      }
    }
  }, [
    locale,
    productsQuery.data,
    productsQuery.isPlaceholderData,
    productsQuery.isSuccess,
    rollback?.query,
    serializedState,
  ]);

  useEffect(() => {
    const rollbackQuery = getCatalogRollbackQuery({
      currentQuery: serializedState,
      lastSuccessfulQuery: lastSuccessfulQueryRef.current,
      isError: productsQuery.isError,
      hasCachedData: catalogData !== undefined,
    });
    if (rollbackQuery === null) return;

    // Router state is external to React; remember the failed URL before replacing it.
    setRollback({
      query: serializedState,
      error: classifyApiError(productsQuery.error),
    });
    router.replace(rollbackQuery ? `${pathname}?${rollbackQuery}` : pathname, { scroll: false });
  }, [catalogData, pathname, productsQuery.error, productsQuery.isError, router, serializedState]);

  const navigate = (next: CatalogUrlState, scroll = false) => {
    if (productsQuery.data !== undefined) {
      // Placeholder data disappears when a different query reaches an error state.
      // Capture it at the user action boundary so the page can retain the last grid.
      setLastSuccessfulCatalog({ data: productsQuery.data, locale });
    }
    setRollback(null);
    const query = serializeCatalogUrlState(next);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll });
  };

  const clearFilters = (target = state) => {
    setPriceError(null);
    navigate({
      ...target,
      categories: [],
      colors: [],
      sizes: [],
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
    });
  };

  const openMobileFilters = () => {
    setMobileDraft(state);
    setPriceError(null);
    setMobileFiltersOpen(true);
  };

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileFiltersOpen]);

  const goToPage = (page: number) => {
    navigate({ ...state, page });
    const headerOffset =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-visible-height"),
      ) || 0;
    const top = (scrollAnchorRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - headerOffset - 24), behavior: "auto" });
  };

  if (productsQuery.isError && (catalogData === undefined || lastSuccessfulCatalog === null)) {
    return (
      <StorefrontApiStatus
        error={productsQuery.error}
        onRetry={() => productsQuery.refetch()}
        resourceLabel={
          mode === "search" ? t("storefront.search.resource") : t("storefront.catalog.resource")
        }
        returnHref="/"
        recoveryAction={{ label: t("storefront.search.viewAll"), href: pathname }}
        variant="route"
      />
    );
  }

  if (isInitialLoading) return <CollectionCatalogLoading />;

  const title =
    mode === "search"
      ? t("storefront.search.resultsFor", { query: state.q })
      : t("storefront.catalog.pageTitle");
  const previewCount = mobilePreviewQuery.data?.meta.total ?? meta?.total ?? 0;
  const catalogWarningError =
    rollback?.error ?? (productsQuery.isError ? classifyApiError(productsQuery.error) : null);
  const showCatalogWarning =
    catalogWarningError !== null &&
    ((productsQuery.isError && catalogData !== undefined) ||
      (rollback !== null &&
        !(
          productsQuery.isSuccess &&
          !productsQuery.isPlaceholderData &&
          serializedState === rollback.query
        )));

  return (
    <div className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-[1800px] px-6 pt-[104px] pb-24 md:px-16 md:pt-[120px]">
      <div className="mb-4 flex gap-2 text-[10px] tracking-[0.15em] text-[#1c1a18]/50 uppercase">
        <Link href="/" className="hover:text-[#1c1a18]">
          {t("storefront.common.home")}
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">
          {mode === "search" ? t("storefront.search.title") : t("storefront.common.collections")}
        </span>
      </div>

      <header className="mb-4">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">
          {title}
        </h1>
      </header>

      {showCatalogWarning ? (
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 border-l-2 border-[#b5573a] bg-[#efe7dc]/65 px-4 py-3 text-xs text-[#1c1a18]/70"
          role="status"
        >
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              {catalogWarningError.status === 400 ? copy.invalidRequestWarning : copy.staleWarning}
            </span>
            {catalogWarningError.status !== null ? (
              <span className="font-mono text-[10px] opacity-65">
                HTTP {catalogWarningError.status}
              </span>
            ) : null}
          </span>
          {catalogWarningError.retryable ? (
            <button
              type="button"
              onClick={() => {
                if (rollback !== null) {
                  router.replace(rollback.query ? `${pathname}?${rollback.query}` : pathname, {
                    scroll: false,
                  });
                  return;
                }
                productsQuery.refetch();
              }}
              className="font-semibold tracking-wider text-[#b5573a] uppercase"
            >
              {copy.retry}
            </button>
          ) : null}
        </div>
      ) : null}

      <div ref={scrollAnchorRef} />
      <ProductToolbar
        totalProducts={meta?.total ?? 0}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setMobileFiltersOpen={openMobileFilters}
        sortBy={state.sort}
        setSortBy={(sort) => navigate({ ...state, sort: sort as StorefrontCatalogSort, page: 1 })}
        sortOptions={sortOptions}
      />

      <ActiveFilters state={state} facets={facets} onChange={navigate} />

      <ProductLayoutMain
        showFilters={showFilters}
        sidebarContent={
          <CatalogFilters
            state={state}
            facets={facets}
            onChange={navigate}
            onClear={() => clearFilters()}
            priceError={priceError}
            setPriceError={setPriceError}
          />
        }
        id={`${mode}-catalog-layout`}
        shouldReduceMotion={Boolean(shouldReduceMotion)}
        filterMotionIntent={showFilters ? "show" : "hide"}
      >
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mb-6 text-sm text-[#1c1a18]/50">{t("storefront.search.noResults")}</p>
            <button
              type="button"
              onClick={() => clearFilters({ ...state, q: "" })}
              className="bg-[#1c1a18] px-8 py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-[#b5573a]"
            >
              {t("storefront.common.clearAllFilters")}
            </button>
          </div>
        ) : (
          <>
            <ProductGrid>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.15 : 0.35,
                    delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.4),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </ProductGrid>
            <CatalogPagination state={state} pages={meta?.pages ?? 1} onPage={goToPage} />
          </>
        )}
      </ProductLayoutMain>

      {mode === "collection" && (
        <section className="relative mt-4 mb-4 h-[300px] w-full overflow-hidden rounded-lg bg-black">
          <FashionImage
            src="/images/collection/lookbook-banner.webp"
            alt={t("storefront.catalog.lookbookAlt")}
            className="opacity-65"
          />
          <div className="absolute inset-0 bg-[#1c1a18]/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <span className="mb-2 text-[10px] font-bold tracking-[0.3em] text-white/80 uppercase">
              {t("storefront.catalog.lookbookLabel")}
            </span>
            <h2 className="mb-4 font-serif text-3xl font-light tracking-[0.1em] text-white uppercase">
              {t("storefront.catalog.comingSoon")}
            </h2>
            <div className="mb-6 h-px w-10 bg-white/40" />
            <Link
              href="/collection"
              className="rounded-sm bg-white px-6 py-2.5 text-[10px] font-semibold tracking-widest text-black uppercase hover:bg-[#efe7dc]"
            >
              {t("storefront.catalog.exploreNow")}
            </Link>
          </div>
        </section>
      )}

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t("common.close")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black/45 md:hidden"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={t("storefront.common.filters")}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: shouldReduceMotion ? 0.01 : 0.25 }}
              className="fixed top-0 right-0 z-50 flex h-dvh w-[88vw] max-w-sm flex-col bg-[#f7f4ef] p-6 shadow-2xl md:hidden"
            >
              <div className="mb-6 flex items-center justify-between border-b border-[#1c1a18]/10 pb-4">
                <h2 className="font-serif text-2xl font-light">{t("storefront.common.filters")}</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label={t("common.close")}
                  className="p-1"
                >
                  <X className="size-6" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <CatalogFilters
                  state={mobileDraft}
                  facets={facets}
                  onChange={setMobileDraft}
                  onClear={() => {
                    setPriceError(null);
                    setMobileDraft({
                      ...mobileDraft,
                      categories: [],
                      colors: [],
                      sizes: [],
                      minPrice: undefined,
                      maxPrice: undefined,
                      page: 1,
                    });
                  }}
                  priceError={priceError}
                  setPriceError={setPriceError}
                  isMobile
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#1c1a18]/10 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setMobileDraft({
                      ...mobileDraft,
                      categories: [],
                      colors: [],
                      sizes: [],
                      minPrice: undefined,
                      maxPrice: undefined,
                      page: 1,
                    })
                  }
                  className="border border-[#1c1a18] py-3 text-xs font-semibold tracking-wider uppercase"
                >
                  {t("storefront.common.clearAll")}
                </button>
                <button
                  type="button"
                  disabled={!isValidCatalogPriceRange(mobileDraft) || mobilePreviewQuery.isFetching}
                  onClick={() => {
                    if (!isValidCatalogPriceRange(mobileDraft)) return;
                    navigate({ ...mobileDraft, page: 1 });
                    setMobileFiltersOpen(false);
                  }}
                  className="bg-[#1c1a18] px-2 py-3 text-xs font-semibold tracking-wider text-white uppercase disabled:opacity-45"
                >
                  {copy.viewProducts(previewCount)}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CollectionCatalogLoading() {
  return (
    <div
      className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-[1800px] px-6 pt-[104px] pb-24 md:px-16 md:pt-[120px]"
      aria-busy="true"
    >
      <div aria-hidden>
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-2.5 w-24" />
        </div>
        <Skeleton className="mb-7 h-12 w-full max-w-md" />
        <div className="mb-6 flex justify-between py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-44" />
        </div>
        <ProductCardSkeletonGrid
          count={6}
          gridClassName="grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </div>
  );
}
