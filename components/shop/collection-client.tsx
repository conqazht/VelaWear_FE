"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  StorefrontCatalogResult,
  StorefrontCatalogSort,
} from "@/lib/api/types";
import { classifyApiError, type ApiErrorClassification } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/i18n/format";
import { useStorefrontProductsQuery } from "@/lib/queries/catalog";
import {
  catalogStateToApiFilters,
  EMPTY_CATALOG_URL_STATE,
  getCatalogRollbackQuery,
  isValidCatalogPriceRange,
  parseCatalogUrlState,
  serializeCatalogUrlState,
  toggleCatalogValue,
  type CatalogUrlState,
} from "@/lib/storefront-catalog";
import { cn } from "@/lib/utils";
import { mapBackendProduct } from "@/lib/vela-data";

type CatalogMode = "collection" | "search";

type CatalogRollback = {
  query: string;
  error: ApiErrorClassification;
};

type CatalogCopy = {
  selected: string;
  noOptions: string;
  priceError: string;
  staleWarning: string;
  invalidRequestWarning: string;
  retry: string;
  previous: string;
  next: string;
  page: string;
  viewProducts: (count: number) => string;
};

function getCatalogCopy(locale: "vi" | "en"): CatalogCopy {
  return locale === "vi"
    ? {
        selected: "Đang lọc",
        noOptions: "Chưa có tùy chọn phù hợp.",
        priceError: "Giá tối thiểu không được lớn hơn giá tối đa.",
        staleWarning: "Dữ liệu mới chưa tải được. Bạn vẫn đang xem kết quả gần nhất.",
        invalidRequestWarning: "Bộ lọc vừa chọn không hợp lệ. Kết quả gần nhất vẫn được giữ lại.",
        retry: "Thử lại",
        previous: "Trang trước",
        next: "Trang sau",
        page: "Trang",
        viewProducts: (count) => `Xem ${count} sản phẩm`,
      }
    : {
        selected: "Active filters",
        noOptions: "No matching options yet.",
        priceError: "Minimum price cannot exceed maximum price.",
        staleWarning: "Fresh data could not be loaded. The latest available results remain visible.",
        invalidRequestWarning: "That filter request is invalid. The latest available results remain visible.",
        retry: "Retry",
        previous: "Previous page",
        next: "Next page",
        page: "Page",
        viewProducts: (count) => `View ${count} products`,
      };
}

type FilterProps = {
  state: CatalogUrlState;
  facets: StorefrontCatalogResult["facets"];
  onChange: (next: CatalogUrlState) => void;
  onClear: () => void;
  priceError: string | null;
  setPriceError: (message: string | null) => void;
  isMobile?: boolean;
};

function PriceRangeInputs({
  state,
  priceRange,
  onChange,
  priceError,
  setPriceError,
}: {
  state: CatalogUrlState;
  priceRange: StorefrontCatalogResult["facets"]["priceRange"];
  onChange: (next: CatalogUrlState) => void;
  priceError: string | null;
  setPriceError: (message: string | null) => void;
}) {
  const { locale, t } = useI18n();
  const copy = getCatalogCopy(locale);
  const [minimum, setMinimum] = useState(state.minPrice?.toString() ?? "");
  const [maximum, setMaximum] = useState(state.maxPrice?.toString() ?? "");

  const commit = () => {
    const minPrice = minimum.trim() === "" ? undefined : Number(minimum);
    const maxPrice = maximum.trim() === "" ? undefined : Number(maximum);
    if (
      (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
      (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0))
    ) return;

    const next = { ...state, minPrice, maxPrice, page: 1 };
    if (!isValidCatalogPriceRange(next)) {
      setPriceError(copy.priceError);
      return;
    }

    setPriceError(null);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={minimum}
          placeholder={t("storefront.catalog.minimum")}
          onChange={(event) => setMinimum(event.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="h-10 rounded-none border-[#1c1a18]/15 bg-transparent px-2 text-xs"
        />
        <span aria-hidden className="text-[#1c1a18]/35">—</span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={maximum}
          placeholder={t("storefront.catalog.maximum")}
          onChange={(event) => setMaximum(event.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="h-10 rounded-none border-[#1c1a18]/15 bg-transparent px-2 text-xs"
        />
      </div>
      {priceRange.min !== null && priceRange.max !== null && (
        <p className="mt-2 text-[10px] text-[#1c1a18]/45">
          {formatCurrency(priceRange.min, locale)} – {formatCurrency(priceRange.max, locale)}
        </p>
      )}
      {priceError && <p className="mt-2 text-xs text-red-700">{priceError}</p>}
    </div>
  );
}

function CatalogFilters({
  state,
  facets,
  onChange,
  onClear,
  priceError,
  setPriceError,
  isMobile = false,
}: FilterProps) {
  const { locale, t } = useI18n();
  const copy = getCatalogCopy(locale);
  const [expanded, setExpanded] = useState({
    category: true,
    size: true,
    color: true,
    price: true,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((current) => ({ ...current, [section]: !current[section] }));
  };

  const hasActiveFilters =
    state.categories.length > 0 ||
    state.colors.length > 0 ||
    state.sizes.length > 0 ||
    state.minPrice !== undefined ||
    state.maxPrice !== undefined;

  const sectionButton = (
    section: keyof typeof expanded,
    label: string,
  ) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      aria-expanded={expanded[section]}
      className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18]"
    >
      <span>{label}</span>
      {expanded[section] ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
    </button>
  );

  return (
    <div className="space-y-7">
      <section className="border-b border-[#1c1a18]/10 pb-6">
        {sectionButton("category", t("storefront.catalog.category"))}
        {expanded.category && (
          <div className="mt-4 space-y-3">
            {facets.categories.length === 0 ? (
              <p className="text-xs text-[#1c1a18]/50">{copy.noOptions}</p>
            ) : (
              facets.categories.map((category) => {
                const selected = state.categories.includes(category.slug);
                const disabled = category.count === 0 && !selected;
                return (
                  <label
                    key={category.id}
                    className={cn(
                      "flex items-center gap-3 text-sm text-[#1c1a18]/70",
                      disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:text-[#1c1a18]",
                    )}
                  >
                    <span className="relative grid size-4 place-items-center">
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={disabled}
                        onChange={() =>
                          onChange({
                            ...state,
                            categories: toggleCatalogValue(state.categories, category.slug),
                            page: 1,
                          })
                        }
                        className="peer size-4 cursor-pointer appearance-none rounded-none border border-[#1c1a18]/25 checked:border-[#1c1a18] checked:bg-[#1c1a18] disabled:cursor-not-allowed"
                      />
                      <Check className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    <span className="text-[11px] tabular-nums text-[#1c1a18]/40">{category.count}</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="border-b border-[#1c1a18]/10 pb-6">
        {sectionButton("size", t("storefront.catalog.size"))}
        {expanded.size && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {facets.sizes.length === 0 ? (
              <p className="col-span-3 text-xs text-[#1c1a18]/50">{copy.noOptions}</p>
            ) : (
              facets.sizes.map((size) => {
                const selected = state.sizes.includes(size.id);
                const disabled = size.count === 0 && !selected;
                return (
                  <button
                    key={size.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange({
                        ...state,
                        sizes: toggleCatalogValue(state.sizes, size.id),
                        page: 1,
                      })
                    }
                    className={cn(
                      "min-h-10 border px-2 text-xs font-medium transition-colors",
                      selected
                        ? "border-[#1c1a18] bg-[#efe7dc] text-[#1c1a18]"
                        : "border-[#1c1a18]/10 text-[#1c1a18]/70 hover:border-[#1c1a18]",
                      disabled && "cursor-not-allowed opacity-35",
                    )}
                    aria-label={`${size.name}, ${size.count}`}
                  >
                    {size.name}
                    <span className="ml-1 text-[9px] text-[#1c1a18]/40">({size.count})</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="border-b border-[#1c1a18]/10 pb-6">
        {sectionButton("color", t("storefront.catalog.color"))}
        {expanded.color && (
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
            {facets.colors.length === 0 ? (
              <p className="col-span-2 text-xs text-[#1c1a18]/50">{copy.noOptions}</p>
            ) : (
              facets.colors.map((color) => {
                const selected = state.colors.includes(color.id);
                const disabled = color.count === 0 && !selected;
                return (
                  <button
                    key={color.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange({
                        ...state,
                        colors: toggleCatalogValue(state.colors, color.id),
                        page: 1,
                      })
                    }
                    className={cn(
                      "flex min-w-0 items-center gap-2 text-left text-xs text-[#1c1a18]/70 hover:text-[#1c1a18]",
                      disabled && "cursor-not-allowed opacity-35",
                    )}
                  >
                    <span
                      className={cn(
                        "size-6 shrink-0 border border-[#1c1a18]/15",
                        selected && "ring-2 ring-[#1c1a18] ring-offset-2 ring-offset-[#f7f4ef]",
                      )}
                      style={{ backgroundColor: color.hexCode || "#e7e0d6" }}
                    />
                    <span className="truncate">{color.name}</span>
                    <span className="ml-auto text-[10px] tabular-nums text-[#1c1a18]/40">{color.count}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="border-b border-[#1c1a18]/10 pb-6">
        {sectionButton("price", t("storefront.catalog.priceRange"))}
        {expanded.price && (
          <div className="mt-4">
            <PriceRangeInputs
              key={`${state.minPrice ?? ""}-${state.maxPrice ?? ""}`}
              state={state}
              priceRange={facets.priceRange}
              onChange={onChange}
              priceError={priceError}
              setPriceError={setPriceError}
            />
          </div>
        )}
      </section>

      {!isMobile && hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="w-full border border-[#b5573a] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#b5573a] transition-colors hover:bg-[#b5573a] hover:text-white"
        >
          {t("storefront.common.clearAllFilters")}
        </button>
      )}
    </div>
  );
}

type ActiveFiltersProps = {
  state: CatalogUrlState;
  facets: StorefrontCatalogResult["facets"];
  onChange: (next: CatalogUrlState) => void;
};

function ActiveFilters({ state, facets, onChange }: ActiveFiltersProps) {
  const { locale } = useI18n();
  const copy = getCatalogCopy(locale);
  const categoryNames = new Map(facets.categories.map((item) => [item.slug, item.name]));
  const colorNames = new Map(facets.colors.map((item) => [item.id, item.name]));
  const sizeNames = new Map(facets.sizes.map((item) => [item.id, item.name]));
  const chips: Array<{ key: string; label: string; remove: () => void }> = [];

  state.categories.forEach((slug) => chips.push({
    key: `category-${slug}`,
    label: categoryNames.get(slug) ?? slug,
    remove: () => onChange({ ...state, categories: state.categories.filter((item) => item !== slug), page: 1 }),
  }));
  state.colors.forEach((id) => chips.push({
    key: `color-${id}`,
    label: colorNames.get(id) ?? String(id),
    remove: () => onChange({ ...state, colors: state.colors.filter((item) => item !== id), page: 1 }),
  }));
  state.sizes.forEach((id) => chips.push({
    key: `size-${id}`,
    label: sizeNames.get(id) ?? String(id),
    remove: () => onChange({ ...state, sizes: state.sizes.filter((item) => item !== id), page: 1 }),
  }));
  if (state.minPrice !== undefined) chips.push({
    key: "min-price",
    label: `≥ ${formatCurrency(state.minPrice, locale)}`,
    remove: () => onChange({ ...state, minPrice: undefined, page: 1 }),
  });
  if (state.maxPrice !== undefined) chips.push({
    key: "max-price",
    label: `≤ ${formatCurrency(state.maxPrice, locale)}`,
    remove: () => onChange({ ...state, maxPrice: undefined, page: 1 }),
  });

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2" aria-label={copy.selected}>
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1c1a18]/50">
        {copy.selected}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 border border-[#1c1a18]/12 bg-white/50 px-3 py-1.5 text-xs text-[#1c1a18] hover:border-[#1c1a18]/35"
        >
          {chip.label}
          <X className="size-3" aria-hidden />
        </button>
      ))}
    </div>
  );
}

function CatalogPagination({
  state,
  pages,
  onPage,
}: {
  state: CatalogUrlState;
  pages: number;
  onPage: (page: number) => void;
}) {
  const { locale } = useI18n();
  const copy = getCatalogCopy(locale);
  if (pages <= 1) return null;

  const candidates = Array.from(new Set([
    1,
    Math.max(1, state.page - 1),
    state.page,
    Math.min(pages, state.page + 1),
    pages,
  ])).sort((a, b) => a - b);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label={copy.page}>
      <button
        type="button"
        disabled={state.page <= 1}
        onClick={() => onPage(state.page - 1)}
        className="border border-[#1c1a18]/15 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-35"
      >
        {copy.previous}
      </button>
      {candidates.map((page, index) => (
        <span key={page} className="contents">
          {index > 0 && candidates[index - 1] !== page - 1 && (
            <span className="px-1 text-[#1c1a18]/40">…</span>
          )}
          <button
            type="button"
            onClick={() => onPage(page)}
            aria-current={page === state.page ? "page" : undefined}
            aria-label={`${copy.page} ${page}`}
            className={cn(
              "size-9 border text-xs",
              page === state.page
                ? "border-[#1c1a18] bg-[#1c1a18] text-white"
                : "border-[#1c1a18]/15 hover:border-[#1c1a18]",
            )}
          >
            {page}
          </button>
        </span>
      ))}
      <button
        type="button"
        disabled={state.page >= pages}
        onClick={() => onPage(state.page + 1)}
        className="border border-[#1c1a18]/15 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-35"
      >
        {copy.next}
      </button>
    </nav>
  );
}

export function CollectionClient({ mode = "collection" }: { mode?: CatalogMode }) {
  const { locale, t } = useI18n();
  const copy = getCatalogCopy(locale);
  const router = useRouter();
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

  const state = useMemo(
    () => parseCatalogUrlState(searchParams),
    [searchParams],
  );
  const serializedState = serializeCatalogUrlState(state);
  const productsQuery = useStorefrontProductsQuery(
    catalogStateToApiFilters(state, locale),
  );
  const mobilePreviewQuery = useStorefrontProductsQuery(
    catalogStateToApiFilters({ ...mobileDraft, page: 1 }, locale, 1),
    { enabled: mobileFiltersOpen && isValidCatalogPriceRange(mobileDraft) },
  );

  const catalogData = productsQuery.data ?? (
    productsQuery.isError && lastSuccessfulCatalog?.locale === locale
      ? lastSuccessfulCatalog.data
      : undefined
  );
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
  }, [locale, productsQuery.data, productsQuery.isPlaceholderData, productsQuery.isSuccess, rollback?.query, serializedState]);

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
    const headerOffset = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-visible-height"),
    ) || 0;
    const top = (scrollAnchorRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - headerOffset - 24), behavior: "auto" });
  };

  if (productsQuery.isError && catalogData === undefined) {
    return (
      <StorefrontApiStatus
        error={productsQuery.error}
        onRetry={() => productsQuery.refetch()}
        resourceLabel={mode === "search" ? t("storefront.search.resource") : t("storefront.catalog.resource")}
        returnHref="/"
        recoveryAction={{ label: t("storefront.search.viewAll"), href: pathname }}
        variant="route"
      />
    );
  }

  if (isInitialLoading) return <CollectionCatalogLoading />;

  const title = mode === "search"
    ? t("storefront.search.resultsFor", { query: state.q })
    : t("storefront.catalog.pageTitle");
  const previewCount = mobilePreviewQuery.data?.meta.total ?? meta?.total ?? 0;
  const catalogWarningError = rollback?.error ?? (
    productsQuery.isError ? classifyApiError(productsQuery.error) : null
  );
  const showCatalogWarning = catalogWarningError !== null && (
    (productsQuery.isError && catalogData !== undefined) ||
    (rollback !== null &&
      !(productsQuery.isSuccess &&
        !productsQuery.isPlaceholderData &&
        serializedState === rollback.query))
  );

  return (
    <div className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-[1800px] px-6 pb-24 pt-[104px] md:px-16 md:pt-[120px]">
      <div className="mb-4 flex gap-2 text-[10px] uppercase tracking-[0.15em] text-[#1c1a18]/50">
        <Link href="/" className="hover:text-[#1c1a18]">{t("storefront.common.home")}</Link>
        <span>/</span>
        <span className="font-medium text-[#1c1a18]">
          {mode === "search" ? t("storefront.search.title") : t("storefront.common.collections")}
        </span>
      </div>

      <header className="mb-4">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[#1c1a18] md:text-5xl">{title}</h1>
      </header>

      {showCatalogWarning ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-l-2 border-[#b5573a] bg-[#efe7dc]/65 px-4 py-3 text-xs text-[#1c1a18]/70" role="status">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{catalogWarningError.status === 400 ? copy.invalidRequestWarning : copy.staleWarning}</span>
            {catalogWarningError.status !== null ? (
              <span className="font-mono text-[10px] opacity-65">HTTP {catalogWarningError.status}</span>
            ) : null}
          </span>
          {catalogWarningError.retryable ? (
            <button
              type="button"
              onClick={() => {
                if (rollback !== null) {
                  router.replace(rollback.query ? `${pathname}?${rollback.query}` : pathname, { scroll: false });
                  return;
                }
                productsQuery.refetch();
              }}
              className="font-semibold uppercase tracking-wider text-[#b5573a]"
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
              className="bg-[#1c1a18] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#b5573a]"
            >
              {t("storefront.common.clearAllFilters")}
            </button>
          </div>
        ) : (
          <>
            <ProductGrid>
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </ProductGrid>
            <CatalogPagination state={state} pages={meta?.pages ?? 1} onPage={goToPage} />
          </>
        )}
      </ProductLayoutMain>

      {mode === "collection" && (
        <section className="relative mb-4 mt-4 h-[300px] w-full overflow-hidden rounded-lg bg-black">
          <FashionImage src="/images/collection/lookbook-banner.webp" alt={t("storefront.catalog.lookbookAlt")} className="opacity-65" />
          <div className="absolute inset-0 bg-[#1c1a18]/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">{t("storefront.catalog.lookbookLabel")}</span>
            <h2 className="mb-4 font-serif text-3xl font-light uppercase tracking-[0.1em] text-white">{t("storefront.catalog.comingSoon")}</h2>
            <div className="mb-6 h-px w-10 bg-white/40" />
            <Link href="/collection" className="rounded-sm bg-white px-6 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-black hover:bg-[#efebe4]">
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
              className="fixed right-0 top-0 z-50 flex h-dvh w-[88vw] max-w-sm flex-col bg-[#f7f4ef] p-6 shadow-2xl md:hidden"
            >
              <div className="mb-6 flex items-center justify-between border-b border-[#1c1a18]/10 pb-4">
                <h2 className="font-serif text-2xl font-light">{t("storefront.common.filters")}</h2>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label={t("common.close")} className="p-1">
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
                      categories: [], colors: [], sizes: [],
                      minPrice: undefined, maxPrice: undefined, page: 1,
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
                  onClick={() => setMobileDraft({
                    ...mobileDraft,
                    categories: [], colors: [], sizes: [],
                    minPrice: undefined, maxPrice: undefined, page: 1,
                  })}
                  className="border border-[#1c1a18] py-3 text-xs font-semibold uppercase tracking-wider"
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
                  className="bg-[#1c1a18] px-2 py-3 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-45"
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
    <div className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-[1800px] px-6 pb-24 pt-[104px] md:px-16 md:pt-[120px]" aria-busy="true">
      <div aria-hidden>
        <div className="mb-4 flex gap-2"><Skeleton className="h-2.5 w-12" /><Skeleton className="h-2.5 w-24" /></div>
        <Skeleton className="mb-7 h-12 w-full max-w-md" />
        <div className="mb-6 flex justify-between py-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-44" /></div>
        <ProductCardSkeletonGrid count={6} gridClassName="grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" />
      </div>
    </div>
  );
}
