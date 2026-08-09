"use client";

import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

export interface SortOption {
  value: string;
  label: string;
}

export function useCommonSortOptions(): SortOption[] {
  const { t } = useI18n();

  return [
    { value: "featured", label: t("storefront.catalog.sortFeatured") },
    { value: "newest", label: t("storefront.catalog.sortNewest") },
    { value: "price_asc", label: t("storefront.catalog.sortPriceLow") },
    { value: "price_desc", label: t("storefront.catalog.sortPriceHigh") },
  ];
}

export interface ProductToolbarProps {
  totalProducts: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  setMobileFiltersOpen: (open: boolean) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOptions: SortOption[];
}

export function ProductToolbar({
  totalProducts,
  showFilters,
  setShowFilters,
  setMobileFiltersOpen,
  sortBy,
  setSortBy,
  sortOptions,
}: ProductToolbarProps) {
  const { t } = useI18n();
  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label ?? sortOptions[0]?.label;

  return (
    <div className="sticky top-[var(--header-visible-height)] z-30 isolate mb-6 flex select-none flex-row items-center justify-between py-3 transition-[top] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] before:absolute before:inset-0 before:-z-10 before:bg-[#f7f4ef]">
      <div className="relative z-10 flex items-center gap-4">
        <p className="hidden text-xs uppercase tracking-widest text-[#1c1a18]/60 md:block">
          {t(
            totalProducts === 1
              ? "storefront.catalog.showingOne"
              : "storefront.catalog.showingMany",
            { count: totalProducts },
          )}
        </p>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="md:hidden flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] border border-[#1c1a18]/15 px-3 py-1.5 rounded-none bg-transparent hover:bg-[#1c1a18]/5 cursor-pointer"
        >
          <span>{t("storefront.common.filters")}</span>
          <SlidersHorizontal className="size-3.5" />
        </button>
      </div>

      <div className="relative z-10 flex items-center gap-4 md:gap-6">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] hover:text-[#b5573a] transition-colors cursor-pointer"
        >
          <span>{showFilters ? t("storefront.catalog.hideFilters") : t("storefront.catalog.showFilters")}</span>
          <SlidersHorizontal className="size-3.5" />
        </button>

        <div className="relative">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value ?? sortOptions[0]?.value ?? sortBy)}>
            <SelectTrigger className="h-auto border-none bg-transparent p-0 pr-0 text-xs font-semibold uppercase tracking-wider shadow-none hover:bg-transparent focus-visible:ring-0">
              <span className="text-[#1c1a18]">{t("storefront.catalog.sortBy")}</span>
              <span className="text-[#1c1a18]/50 ml-1">{currentSortLabel}</span>
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              side="bottom"
              sideOffset={8}
              align="end"
              className="min-w-[170px] rounded-md border border-hairline bg-white p-1.5 shadow-md"
            >
              {sortOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-xl px-3 py-2.5 text-sm text-[#1c1a18] data-highlighted:bg-[#efe7dc] data-highlighted:text-[#1c1a18]"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 w-full transition-all duration-300", className)}>
      {children}
    </div>
  );
}

export interface ProductLayoutMainProps {
  showFilters: boolean;
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  shouldReduceMotion?: boolean;
  filterMotionIntent?: "show" | "hide" | null;
}

export function ProductLayoutMain({
  showFilters,
  sidebarContent,
  children,
  id = "product-layout",
  shouldReduceMotion = false,
  filterMotionIntent = null,
}: ProductLayoutMainProps) {
  return (
    <LayoutGroup id={id}>
      <motion.div
        layout="position"
        className={cn(
          "flex flex-col items-start relative",
          showFilters ? "gap-8 md:flex-row" : "gap-0 md:flex-row"
        )}
      >
        <motion.aside
          layout
          style={{
            width: showFilters ? "16rem" : "0rem",
            opacity: showFilters ? 1 : 0,
            transitionProperty: "width, opacity, top",
            transitionDuration: shouldReduceMotion
              ? "10ms"
              : filterMotionIntent === "hide"
                ? "260ms, 260ms, 220ms"
                : "220ms",
            transitionTimingFunction:
              filterMotionIntent === "hide"
                ? "cubic-bezier(0.77, 0, 0.175, 1), cubic-bezier(0.77, 0, 0.175, 1), cubic-bezier(0.23, 1, 0.32, 1)"
                : "cubic-bezier(0.23, 1, 0.32, 1)",
          }}
          aria-hidden={!showFilters}
          className="sticky top-[calc(var(--header-visible-height)+60px)] hidden min-w-0 shrink-0 overflow-hidden will-change-[width,opacity] md:block"
        >
          <motion.div
            animate={{
              transform:
                shouldReduceMotion || showFilters
                  ? "translate3d(0, 0, 0)"
                  : "translate3d(-12px, 0, 0)",
            }}
            transition={{
              duration: shouldReduceMotion ? 0.01 : 0.18,
              ease: [0.23, 1, 0.32, 1],
            }}
            className={cn(
              "w-64 pr-8 will-change-transform",
              !showFilters && "pointer-events-none"
            )}
          >
            {sidebarContent}
          </motion.div>
        </motion.aside>

        <motion.div layout="position" className="flex-grow w-full min-h-[500px] lg:min-h-[700px] pb-12">
          {children}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
