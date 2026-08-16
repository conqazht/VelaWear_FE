import { describe, expect, it } from "vitest";

import {
  catalogStateToApiFilters,
  createCatalogHref,
  getCatalogRollbackQuery,
  parseCatalogUrlState,
  serializeCatalogUrlState,
  toggleCatalogValue,
} from "@/lib/storefront-catalog";

describe("storefront catalog URL state", () => {
  it("parses, validates and de-duplicates filters from the URL", () => {
    const state = parseCatalogUrlState(
      new URLSearchParams(
        "q=linen&categories=ao,ao-khoac,ao&colors=2,2,invalid,-1&sizes=3,4&minPrice=200000&maxPrice=900000&sort=price-asc&page=3",
      ),
    );

    expect(state).toEqual({
      q: "linen",
      categories: ["ao", "ao-khoac"],
      colors: [2],
      sizes: [3, 4],
      minPrice: 200000,
      maxPrice: 900000,
      sort: "price-asc",
      page: 3,
    });
  });

  it("serializes a stable public URL and omits defaults", () => {
    const href = createCatalogHref({
      categories: ["ao", "ao-khoac"],
      colors: [4, 2],
      sort: "newest",
      page: 1,
    });

    expect(href).toBe("/collection?categories=ao%2Cao-khoac&colors=4%2C2&sort=newest");
    expect(
      serializeCatalogUrlState(
        parseCatalogUrlState(new URL(href, "https://vela.test").searchParams),
      ),
    ).toBe("categories=ao%2Cao-khoac&colors=4%2C2&sort=newest");
  });

  it("maps friendly URL keys to the storefront API contract", () => {
    const state = parseCatalogUrlState(
      new URLSearchParams("categories=quan&colors=1,2&sizes=5&sort=price-desc&page=2"),
    );

    expect(catalogStateToApiFilters(state, "vi")).toEqual({
      q: undefined,
      categorySlugs: ["quan"],
      colorIds: [1, 2],
      sizeIds: [5],
      minPrice: undefined,
      maxPrice: undefined,
      sort: "price-desc",
      page: 2,
      size: 12,
      locale: "vi",
    });
  });

  it("toggles a multi-select value without mutating the input", () => {
    const original = [1, 2];
    expect(toggleCatalogValue(original, 2)).toEqual([1]);
    expect(toggleCatalogValue(original, 3)).toEqual([1, 2, 3]);
    expect(original).toEqual([1, 2]);
  });

  it("rolls a failed new filter back but keeps a same-state background error", () => {
    expect(
      getCatalogRollbackQuery({
        currentQuery: "categories=ao&colors=2",
        lastSuccessfulQuery: "categories=ao",
        isError: true,
        hasCachedData: true,
      }),
    ).toBe("categories=ao");

    expect(
      getCatalogRollbackQuery({
        currentQuery: "categories=ao",
        lastSuccessfulQuery: "categories=ao",
        isError: true,
        hasCachedData: true,
      }),
    ).toBeNull();
  });
});
