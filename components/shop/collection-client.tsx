"use client";

import { useMemo, useRef, useState } from "react";
import { X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shop/product-card";
import { ProductCardSkeletonGrid } from "@/components/shop/product-skeletons";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { useI18n } from "@/components/providers/i18n-provider";
import { localizeFixtureProduct } from "@/lib/i18n/fixture-products";
import { cn } from "@/lib/utils";
import { Product, mapBackendProduct } from "@/lib/vela-data";
import { ProductToolbar, ProductGrid, ProductLayoutMain, useCommonSortOptions } from "@/components/shop/product-layout-components";
import {
  useCategoriesQuery,
  useProductsQuery,
  useColorsQuery,
  useSizesQuery,
} from "@/lib/queries/catalog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
interface FilterGroupsProps {
  selectedCategoryId: number | "ALL";
  selectedColorId: number | null;
  selectedSizeId: number | null;
  minPrice: string;
  maxPrice: string;
  categoryTabsList: { id: number | "ALL"; name: string }[];
  colors: { id: number; name: string; hexCode: string }[];
  sizes: { id: number; name: string }[];
  expandedSections: { category: boolean; size: boolean; color: boolean; price: boolean };
  setSelectedCategoryId: (id: number | "ALL") => void;
  setSelectedColorId: (id: number | null) => void;
  setSelectedSizeId: (id: number | null) => void;
  setMinPrice: (price: string) => void;
  setMaxPrice: (price: string) => void;
  setPage: (page: number) => void;
  toggleSection: (section: "category" | "size" | "color" | "price") => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  isMobile?: boolean;
}

function FilterGroups({
  selectedCategoryId,
  selectedColorId,
  selectedSizeId,
  minPrice,
  maxPrice,
  categoryTabsList,
  colors,
  sizes,
  expandedSections,
  setSelectedCategoryId,
  setSelectedColorId,
  setSelectedSizeId,
  setMinPrice,
  setMaxPrice,
  setPage,
  toggleSection,
  clearAllFilters,
  hasActiveFilters,
  isMobile = false,
}: FilterGroupsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      {/* Category Section */}
      <div className="border-b border-[#1c1a18]/10 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("category")}
          className="w-full text-left font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] flex justify-between items-center select-none cursor-pointer"
        >
          <span>{t("storefront.catalog.category")}</span>
          {expandedSections.category ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <AnimatePresence initial={false}>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3 text-sm text-[#1c1a18]/70">
                {categoryTabsList.map((cat) => {
                  const isChecked = selectedCategoryId === cat.id;
                  return (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedCategoryId(isChecked ? "ALL" : cat.id);
                            setPage(1);
                          }}
                          className="peer appearance-none h-4 w-4 border border-[#1c1a18]/25 rounded-none bg-canvas checked:bg-[#1c1a18] checked:border-[#1c1a18] cursor-pointer transition-colors"
                        />
                        <Check className="absolute size-3 text-[#f7f4ef] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <span className="group-hover:text-[#1c1a18] transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size Section */}
      <div className="border-b border-[#1c1a18]/10 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("size")}
          className="w-full text-left font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] flex justify-between items-center select-none cursor-pointer"
        >
          <span>{t("storefront.catalog.size")}</span>
          {expandedSections.size ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <AnimatePresence initial={false}>
          {expandedSections.size && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-3 gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSizeId === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        setSelectedSizeId(isSelected ? null : size.id);
                        setPage(1);
                      }}
                      className={cn(
                        "py-2 text-center text-xs font-medium border rounded-none transition-colors cursor-pointer",
                        isSelected
                          ? "border-[#1c1a18] bg-[#efe7dc] text-[#1c1a18]"
                          : "border-[#1c1a18]/10 hover:border-[#1c1a18] text-[#1c1a18]/70 bg-transparent"
                      )}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color Section */}
      <div className="border-b border-[#1c1a18]/10 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("color")}
          className="w-full text-left font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] flex justify-between items-center select-none cursor-pointer"
        >
          <span>{t("storefront.catalog.color")}</span>
          {expandedSections.color ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <AnimatePresence initial={false}>
          {expandedSections.color && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 flex flex-wrap gap-3">
                {colors.map((color) => {
                  const isSelected = selectedColorId === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setSelectedColorId(isSelected ? null : color.id);
                        setPage(1);
                      }}
                      title={color.name}
                      style={{ backgroundColor: color.hexCode || "#efebe4" }}
                      className={cn(
                        "w-8 h-8 rounded-none border border-[#1c1a18]/10 shadow-sm transition-transform duration-150 ease-out cursor-pointer relative",
                        isSelected
                          ? "ring-2 ring-offset-2 ring-[#1c1a18] ring-offset-[#f7f4ef]"
                          : "hover:scale-105"
                      )}
                    >
                      {color.name.toLowerCase() === "white" && (
                        <div className="absolute inset-0 border border-[#1c1a18]/5 rounded-none pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range Section */}
      <div className="border-b border-[#1c1a18]/10 pb-6">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full text-left font-sans text-xs font-semibold uppercase tracking-[0.15em] text-[#1c1a18] flex justify-between items-center select-none cursor-pointer"
        >
          <span>{t("storefront.catalog.priceRange")}</span>
          {expandedSections.price ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <AnimatePresence initial={false}>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 flex items-center gap-3">
                <Input
                  type="number"
                  placeholder={t("storefront.catalog.minimum")}
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-none border-[#1c1a18]/15 bg-transparent px-3 text-xs focus-visible:ring-[#b85a3c]/30"
                />
                <span className="text-xs text-[#1c1a18]/40">—</span>
                <Input
                  type="number"
                  placeholder={t("storefront.catalog.maximum")}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-none border-[#1c1a18]/15 bg-transparent px-3 text-xs focus-visible:ring-[#b85a3c]/30"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear Filters Button (Desktop Sidebar only) */}
      {!isMobile && hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full py-2.5 border border-[#b5573a] text-[#b5573a] hover:bg-[#b5573a] hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider rounded-none cursor-pointer"
        >
          {t("storefront.common.clearAllFilters")}
        </button>
      )}
    </div>
  );
}

export function CollectionClient({ products: initialProducts }: { products: Product[] }) {
  const { locale: activeLocale, t } = useI18n();
  const localizedInitialProducts = useMemo(
    () => initialProducts.map((product) => localizeFixtureProduct(product, activeLocale)),
    [activeLocale, initialProducts],
  );
  const sortOptions = useCommonSortOptions();
  const collectionScrollAnchorRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const filterMotionIntent: "show" | "hide" = "show";
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "ALL">("ALL");
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  
  // Filter visibility default to hidden
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Expanded Sidebar sections
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    size: true,
    color: true,
    price: true,
  });

  const [sortBy, setSortBy] = useState<string>("featured");

  const backendSortMap: Record<string, string> = {
    featured: "", // default sort
    newest: "createdAt,desc",
    price_asc: "price,asc",
    price_desc: "price,desc",
  };

  const [page, setPage] = useState(1);
  const size = 12;

  const categoriesQuery = useCategoriesQuery({ size: 100, locale: activeLocale });
  const colorsQuery = useColorsQuery({ size: 100, locale: activeLocale });
  const sizesQuery = useSizesQuery({ size: 100, locale: activeLocale });
  const allProductsQuery = useProductsQuery({
    size: 1000,
    sort: "createdAt,desc",
    locale: activeLocale,
  });
  
  const productsQuery = useProductsQuery({ 
    page,
    size,
    sort: backendSortMap[sortBy] || undefined,
    categoryId: selectedCategoryId === "ALL" ? undefined : selectedCategoryId,
    colorId: selectedColorId ?? undefined,
    sizeId: selectedSizeId ?? undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    locale: activeLocale 
  });

  const categories = useMemo(
    () => categoriesQuery.data?.result ?? [],
    [categoriesQuery.data]
  );

  const colors = useMemo(
    () => colorsQuery.data?.result ?? [],
    [colorsQuery.data]
  );

  const sizes = useMemo(
    () => sizesQuery.data?.result ?? [],
    [sizesQuery.data]
  );
  
  const products = useMemo(
    () =>
      productsQuery.data?.result?.map((product) =>
        mapBackendProduct(product, activeLocale)
      ) ?? (!productsQuery.isError && page === 1 && selectedCategoryId === "ALL" && !selectedColorId && !selectedSizeId && !minPrice && !maxPrice ? localizedInitialProducts.slice(0, size) : []),
    [activeLocale, localizedInitialProducts, productsQuery.data, productsQuery.isError, page, selectedCategoryId, selectedColorId, selectedSizeId, minPrice, maxPrice, size]
  );

  const meta = productsQuery.data?.meta;

  const isInitialLoading =
    categoriesQuery.isLoading && productsQuery.isLoading && products.length === 0;

  const categoryIdsWithProducts = useMemo(() => {
    const ids = new Set<number>();
    allProductsQuery.data?.result?.forEach((product) => {
      if (typeof product.categoryId === "number") {
        ids.add(product.categoryId);
      }
    });
    return ids;
  }, [allProductsQuery.data]);

  // Compute category list dynamically from backend categories containing products
  const categoryTabsList = useMemo(() => {
    const list: { id: number | "ALL"; name: string }[] = [];
    categories.forEach((cat) => {
      if (categoryIdsWithProducts.has(cat.id)) {
        list.push({ id: cat.id, name: cat.name });
      }
    });
    return list;
  }, [categories, categoryIdsWithProducts]);

  const toggleSection = (section: "category" | "size" | "color" | "price") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters = 
    selectedColorId !== null || 
    selectedSizeId !== null || 
    minPrice !== "" || 
    maxPrice !== "" || 
    selectedCategoryId !== "ALL";

  const clearAllFilters = () => {
    setSelectedColorId(null);
    setSelectedSizeId(null);
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategoryId("ALL");
    setPage(1);
  };

  const filterProps = {
    selectedCategoryId,
    selectedColorId,
    selectedSizeId,
    minPrice,
    maxPrice,
    categoryTabsList,
    colors: colors as { id: number; name: string; hexCode: string }[],
    sizes: sizes as { id: number; name: string }[],
    expandedSections,
    setSelectedCategoryId,
    setSelectedColorId,
    setSelectedSizeId,
    setMinPrice,
    setMaxPrice,
    setPage,
    toggleSection,
    clearAllFilters,
    hasActiveFilters,
  };

  const scrollToCollectionTop = () => {
    const headerOffset = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-visible-height")
    ) || 0;
    const anchorTop =
      (collectionScrollAnchorRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    const targetTop = anchorTop - headerOffset - 28;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "auto",
    });
  };

  const goToPage = (targetPage: number) => {
    if (!meta || targetPage === page || targetPage < 1 || targetPage > meta.pages) return;
    scrollToCollectionTop();
    setPage(targetPage);
  };

  // Render shadcn page numbers dynamically with ellipses
  const renderPageNumbers = () => {
    const totalPages = meta?.pages || 1;
    const items: (number | "...")[] = [];
    const siblingCount = 1;

    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(page - siblingCount, 1);
      const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        for (let i = 1; i <= leftItemCount; i++) {
          items.push(i);
        }
        items.push("...");
        items.push(lastPageIndex);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        items.push(firstPageIndex);
        items.push("...");
        for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
          items.push(i);
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        items.push(firstPageIndex);
        items.push("...");
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          items.push(i);
        }
        items.push("...");
        items.push(lastPageIndex);
      }
    }

    return items.map((item, index) => {
      if (item === "...") {
        return (
          <PaginationItem key={`dots-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      return (
        <PaginationItem key={item}>
          <PaginationLink
            href="#"
            isActive={item === page}
            onClick={(e) => {
              e.preventDefault();
              goToPage(Number(item));
            }}
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <>
      {isInitialLoading ? (
        <CollectionCatalogLoading />
      ) : productsQuery.isError ? (
          <StorefrontApiStatus
            error={productsQuery.error}
            onRetry={() => void productsQuery.refetch()}
            resourceLabel={t("storefront.catalog.resource")}
            returnHref="/"
            variant="panel"
          />
        ) : (
        <div className="w-full">
          <div ref={collectionScrollAnchorRef} className="h-px w-full" aria-hidden="true" />

          <ProductToolbar
            totalProducts={meta?.total || products.length}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            setMobileFiltersOpen={setMobileFiltersOpen}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOptions={sortOptions}
          />

          {/* Main Content Area */}
          <ProductLayoutMain
            showFilters={showFilters}
            sidebarContent={<FilterGroups {...filterProps} />}
            id="collection-layout"
            shouldReduceMotion={Boolean(shouldReduceMotion)}
            filterMotionIntent={filterMotionIntent}
          >
            {products.length === 0 ? (
              <div className="py-20 text-center select-none min-h-[580px] flex items-center justify-center">
                <p className="text-sm text-[#1c1a18]/50">
                  {t("storefront.catalog.noProducts")}
                </p>
              </div>
            ) : (
              <div className="flex-grow w-full">
                <ProductGrid>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} imageAspect="collection" />
                  ))}
                </ProductGrid>

                {/* Pagination Controls */}
                {meta && meta.pages > 1 && (
                  <div className="border-b border-[#1c1a18]/10 pb-4 pt-4">
                    <Pagination aria-label={t("storefront.pagination.label")} className="select-none">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            text={t("storefront.pagination.previous")}
                            aria-label={t("storefront.pagination.previousAria")}
                            onClick={(e) => {
                              e.preventDefault();
                              goToPage(page - 1);
                            }}
                            aria-disabled={page === 1}
                            className={cn(page === 1 && "pointer-events-none opacity-50")}
                          />
                        </PaginationItem>
                        
                        {renderPageNumbers()}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            text={t("storefront.pagination.next")}
                            aria-label={t("storefront.pagination.nextAria")}
                            onClick={(e) => {
                              e.preventDefault();
                              goToPage(page + 1);
                            }}
                            aria-disabled={page === meta.pages}
                            className={cn(page === meta.pages && "pointer-events-none opacity-50")}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </ProductLayoutMain>
        </div>
      )}

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/45 z-50 md:hidden"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-[85vw] max-w-sm bg-[#f7f4ef] z-50 p-6 overflow-y-auto flex flex-col shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-[#1c1a18]/10 pb-4 mb-6">
                <h2 className="font-serif text-2xl font-light text-[#1c1a18]">{t("storefront.common.filters")}</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 hover:text-[#b5573a] transition-colors cursor-pointer"
                >
                  <X className="size-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-1">
                <FilterGroups {...filterProps} isMobile={true} />
              </div>

              <div className="border-t border-[#1c1a18]/10 pt-4 mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 py-3 border border-[#1c1a18] text-[#1c1a18] text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[#1c1a18]/5 rounded-none cursor-pointer"
                >
                  {t("storefront.common.clearAll")}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-3 bg-[#1c1a18] text-white text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[#b5573a] rounded-none cursor-pointer"
                >
                  {t("storefront.common.apply")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CollectionCatalogLoading() {
  return (
    <div className="w-full" aria-busy="true">
      <div aria-hidden="true">
        <div className="sticky top-[var(--header-visible-height)] z-30 mb-6 flex items-center justify-between py-3">
          <Skeleton className="hidden h-3 w-24 bg-[#efe7dc] md:block" />
          <Skeleton className="h-8 w-24 rounded-none bg-[#efe7dc] md:hidden" />
          <div className="flex items-center gap-4 md:gap-6">
            <Skeleton className="hidden h-3 w-24 bg-[#efe7dc] md:block" />
            <Skeleton className="h-3 w-32 bg-[#efe7dc]" />
          </div>
        </div>

        <ProductLayoutMain
          showFilters={false}
          sidebarContent={null}
          id="collection-loading-layout"
        >
          <ProductCardSkeletonGrid
            count={6}
            imageAspect="square"
            gridClassName="grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          />
        </ProductLayoutMain>
      </div>
    </div>
  );
}
