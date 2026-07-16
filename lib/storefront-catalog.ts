import type {
  StorefrontCatalogFilters,
  StorefrontCatalogSort,
} from "@/lib/api/types";

export const STOREFRONT_SORTS: readonly StorefrontCatalogSort[] = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
];

export type CatalogUrlState = {
  q: string;
  categories: string[];
  colors: number[];
  sizes: number[];
  minPrice?: number;
  maxPrice?: number;
  sort: StorefrontCatalogSort;
  page: number;
};

export const EMPTY_CATALOG_URL_STATE: CatalogUrlState = {
  q: "",
  categories: [],
  colors: [],
  sizes: [],
  sort: "featured",
  page: 1,
};

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return unique(value.split(",").map((item) => item.trim()).filter(Boolean));
}

function parseIds(value: string | null): number[] {
  return unique(
    parseCsv(value)
      .map(Number)
      .filter((id) => Number.isSafeInteger(id) && id > 0),
  );
}

function parseOptionalPrice(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function parseSort(value: string | null): StorefrontCatalogSort {
  return STOREFRONT_SORTS.includes(value as StorefrontCatalogSort)
    ? (value as StorefrontCatalogSort)
    : "featured";
}

export function parseCatalogUrlState(
  searchParams: Pick<URLSearchParams, "get">,
): CatalogUrlState {
  return {
    q: (searchParams.get("q") ?? "").trim().slice(0, 160),
    categories: parseCsv(searchParams.get("categories")),
    colors: parseIds(searchParams.get("colors")),
    sizes: parseIds(searchParams.get("sizes")),
    minPrice: parseOptionalPrice(searchParams.get("minPrice")),
    maxPrice: parseOptionalPrice(searchParams.get("maxPrice")),
    sort: parseSort(searchParams.get("sort")),
    page: parsePage(searchParams.get("page")),
  };
}

export function serializeCatalogUrlState(state: CatalogUrlState): string {
  const params = new URLSearchParams();

  if (state.q.trim()) params.set("q", state.q.trim());
  if (state.categories.length > 0) params.set("categories", unique(state.categories).join(","));
  if (state.colors.length > 0) params.set("colors", unique(state.colors).join(","));
  if (state.sizes.length > 0) params.set("sizes", unique(state.sizes).join(","));
  if (state.minPrice !== undefined) params.set("minPrice", String(state.minPrice));
  if (state.maxPrice !== undefined) params.set("maxPrice", String(state.maxPrice));
  if (state.sort !== "featured") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));

  return params.toString();
}

export function createCatalogHref(
  state: Partial<CatalogUrlState>,
  pathname = "/collection",
): string {
  const query = serializeCatalogUrlState({
    ...EMPTY_CATALOG_URL_STATE,
    ...state,
  });
  return query ? `${pathname}?${query}` : pathname;
}

export function catalogStateToApiFilters(
  state: CatalogUrlState,
  locale: string,
  size = 12,
): StorefrontCatalogFilters {
  return {
    q: state.q || undefined,
    categorySlugs: state.categories.length > 0 ? state.categories : undefined,
    colorIds: state.colors.length > 0 ? state.colors : undefined,
    sizeIds: state.sizes.length > 0 ? state.sizes : undefined,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    sort: state.sort,
    page: state.page,
    size,
    locale,
  };
}

export function toggleCatalogValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((candidate) => candidate !== value)
    : [...values, value];
}

export function isValidCatalogPriceRange(state: CatalogUrlState): boolean {
  return (
    state.minPrice === undefined ||
    state.maxPrice === undefined ||
    state.minPrice <= state.maxPrice
  );
}

export function getCatalogRollbackQuery({
  currentQuery,
  lastSuccessfulQuery,
  isError,
  hasCachedData,
}: {
  currentQuery: string;
  lastSuccessfulQuery: string | null;
  isError: boolean;
  hasCachedData: boolean;
}): string | null {
  if (
    !isError ||
    !hasCachedData ||
    lastSuccessfulQuery === null ||
    lastSuccessfulQuery === currentQuery
  ) {
    return null;
  }
  return lastSuccessfulQuery;
}
