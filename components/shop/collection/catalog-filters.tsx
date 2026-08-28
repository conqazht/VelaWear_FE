"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { StorefrontCatalogResult } from "@/lib/api/types";
import { formatCurrency } from "@/lib/i18n/format";
import {
  isValidCatalogPriceRange,
  toggleCatalogValue,
  type CatalogUrlState,
} from "@/lib/storefront-catalog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";
import { getCatalogCopy, type FilterProps } from "@/components/shop/collection/catalog-types";

export function PriceRangeInputs({
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
    )
      return;

    const next = { ...state, minPrice, maxPrice, page: 1 };
    if (!isValidCatalogPriceRange(next)) {
      setPriceError(copy.priceError);
      return;
    }

    setPriceError(null);
    onChange(next);
  };

  const applyPreset = (min?: number, max?: number) => {
    setMinimum(min?.toString() ?? "");
    setMaximum(max?.toString() ?? "");
    setPriceError(null);
    onChange({ ...state, minPrice: min, maxPrice: max, page: 1 });
  };

  const presets = [
    { label: "< 300k", min: undefined, max: 300000 },
    { label: "300k – 600k", min: 300000, max: 600000 },
    { label: "> 600k", min: 600000, max: undefined },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 py-0.5">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={minimum}
          placeholder={t("storefront.catalog.minimum")}
          onChange={(event) => setMinimum(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
          }}
          className="h-9 min-w-0 flex-1 [appearance:textfield] rounded-sm border-[#1c1a18]/20 bg-transparent px-2 text-xs focus-visible:border-[#b5573a] focus-visible:ring-2 focus-visible:ring-[#b5573a]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span aria-hidden className="shrink-0 text-[#1c1a18]/35">
          —
        </span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={maximum}
          placeholder={t("storefront.catalog.maximum")}
          onChange={(event) => setMaximum(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
          }}
          className="h-9 min-w-0 flex-1 [appearance:textfield] rounded-sm border-[#1c1a18]/20 bg-transparent px-2 text-xs focus-visible:border-[#b5573a] focus-visible:ring-2 focus-visible:ring-[#b5573a]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={commit}
          className="h-9 shrink-0 cursor-pointer rounded-full border border-[#1c1a18] bg-[#1c1a18] px-4 text-xs font-bold tracking-wider text-white uppercase transition-all hover:border-[#b5573a] hover:bg-[#b5573a] active:scale-[0.96]"
        >
          {locale === "vi" ? "Lọc" : "Apply"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {presets.map((preset) => {
          const isActive = state.minPrice === preset.min && state.maxPrice === preset.max;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.min, preset.max)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-[11px] font-medium transition-all active:scale-[0.96]",
                isActive
                  ? "border-[#1c1a18] bg-[#efe7dc] font-bold text-[#1c1a18]"
                  : "border-[#1c1a18]/15 text-[#1c1a18]/70 hover:border-[#1c1a18]/40 hover:text-[#1c1a18]",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {priceRange.min !== null && priceRange.max !== null && (
        <p className="text-[10px] text-[#1c1a18]/45">
          {formatCurrency(priceRange.min, locale)} – {formatCurrency(priceRange.max, locale)}
        </p>
      )}
      {priceError && <p className="text-xs text-red-700">{priceError}</p>}
    </div>
  );
}

export function CatalogFilters({
  state,
  facets,
  onChange,
  onClear,
  priceError,
  setPriceError,
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

  const sectionButton = (section: keyof typeof expanded, label: string) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      aria-expanded={expanded[section]}
      className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-semibold tracking-[0.15em] text-[#1c1a18] uppercase"
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
                      disabled
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer hover:text-[#1c1a18]",
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
                        className="peer size-4 cursor-pointer appearance-none rounded-sm border border-[#1c1a18]/25 checked:border-[#1c1a18] checked:bg-[#1c1a18] disabled:cursor-not-allowed"
                      />
                      <Check className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    <span className="text-[11px] text-[#1c1a18]/40 tabular-nums">
                      {category.count}
                    </span>
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
                const isLongName = size.name.length > 8;
                return (
                  <button
                    key={size.id}
                    type="button"
                    disabled={disabled}
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({
                        ...state,
                        sizes: toggleCatalogValue(state.sizes, size.id),
                        page: 1,
                      })
                    }
                    className={cn(
                      "flex min-h-10 flex-col items-center justify-center rounded-sm border px-1.5 py-1.5 text-center leading-none transition-colors",
                      isLongName ? "col-span-2" : "col-span-1",
                      selected
                        ? "border-[#1c1a18] bg-[#efe7dc] text-[#1c1a18]"
                        : "border-[#1c1a18]/10 text-[#1c1a18]/70 hover:border-[#1c1a18]",
                      disabled && "cursor-not-allowed opacity-35",
                    )}
                    aria-label={`${size.name}, ${size.count}`}
                  >
                    <span className="max-w-full truncate text-[10px] leading-tight font-medium tracking-tight uppercase">
                      {size.name}
                    </span>
                    <span className="font-numeric mt-0.5 text-[9px] leading-tight text-[#1c1a18]/40">
                      ({size.count})
                    </span>
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
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({
                        ...state,
                        colors: toggleCatalogValue(state.colors, color.id),
                        page: 1,
                      })
                    }
                    className={cn(
                      "group flex min-w-0 items-center gap-2 text-left text-xs text-[#1c1a18]/70 hover:text-[#1c1a18]",
                      disabled && "cursor-not-allowed opacity-35",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full transition-all",
                        selected ? "border-2 border-[#1c1a18]" : "border border-transparent",
                      )}
                    >
                      <span
                        className="size-5 rounded-full border border-[#1c1a18]/15"
                        style={{ backgroundColor: color.hexCode || "#e7e0d6" }}
                      />
                    </span>
                    <span className="truncate">{color.name}</span>
                    <span className="ml-auto text-[10px] text-[#1c1a18]/40 tabular-nums">
                      {color.count}
                    </span>
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

      {hasActiveFilters && (
        <div className="pt-4 pb-8">
          <button
            type="button"
            onClick={onClear}
            className="w-full cursor-pointer rounded-full border border-[#b5573a] py-2.5 text-xs font-bold tracking-wider text-[#b5573a] uppercase shadow-2xs transition-all hover:bg-[#b5573a] hover:text-white active:scale-[0.96]"
          >
            {t("storefront.common.clearAllFilters")}
          </button>
        </div>
      )}
    </div>
  );
}
