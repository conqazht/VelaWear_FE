"use client";

import { X } from "lucide-react";
import { formatCurrency } from "@/lib/i18n/format";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  getCatalogCopy,
  type ActiveFiltersProps,
} from "@/components/shop/collection/catalog-types";

export function ActiveFilters({ state, facets, onChange }: ActiveFiltersProps) {
  const { locale } = useI18n();
  const copy = getCatalogCopy(locale);
  const categoryNames = new Map(facets.categories.map((item) => [item.slug, item.name]));
  const colorNames = new Map(facets.colors.map((item) => [item.id, item.name]));
  const sizeNames = new Map(facets.sizes.map((item) => [item.id, item.name]));
  const chips: Array<{ key: string; label: string; remove: () => void }> = [];

  state.categories.forEach((slug) =>
    chips.push({
      key: `category-${slug}`,
      label: categoryNames.get(slug) ?? slug,
      remove: () =>
        onChange({
          ...state,
          categories: state.categories.filter((item) => item !== slug),
          page: 1,
        }),
    }),
  );
  state.colors.forEach((id) =>
    chips.push({
      key: `color-${id}`,
      label: colorNames.get(id) ?? String(id),
      remove: () =>
        onChange({ ...state, colors: state.colors.filter((item) => item !== id), page: 1 }),
    }),
  );
  state.sizes.forEach((id) =>
    chips.push({
      key: `size-${id}`,
      label: sizeNames.get(id) ?? String(id),
      remove: () =>
        onChange({ ...state, sizes: state.sizes.filter((item) => item !== id), page: 1 }),
    }),
  );
  if (state.minPrice !== undefined && state.maxPrice !== undefined) {
    chips.push({
      key: "price-range",
      label: `${formatCurrency(state.minPrice, locale)} – ${formatCurrency(state.maxPrice, locale)}`,
      remove: () => onChange({ ...state, minPrice: undefined, maxPrice: undefined, page: 1 }),
    });
  } else if (state.minPrice !== undefined) {
    chips.push({
      key: "min-price",
      label: `≥ ${formatCurrency(state.minPrice, locale)}`,
      remove: () => onChange({ ...state, minPrice: undefined, page: 1 }),
    });
  } else if (state.maxPrice !== undefined) {
    chips.push({
      key: "max-price",
      label: `≤ ${formatCurrency(state.maxPrice, locale)}`,
      remove: () => onChange({ ...state, maxPrice: undefined, page: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2" aria-label={copy.selected}>
      <span className="mr-1 text-[10px] font-semibold tracking-[0.15em] text-[#1c1a18]/50 uppercase">
        {copy.selected}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#1c1a18]/15 bg-white px-3.5 py-1 text-xs font-medium text-[#1c1a18] shadow-2xs transition-all hover:border-[#b5573a] hover:text-[#b5573a] active:scale-[0.96]"
        >
          {chip.label}
          <X className="size-3" aria-hidden />
        </button>
      ))}
    </div>
  );
}
