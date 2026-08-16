import { expect, test } from "../fixtures/fullstack";

type CatalogProduct = {
  name: string;
  price?: number | null;
  pricing?: {
    effectivePrice: number;
  } | null;
};

type StorefrontCatalogEnvelope = {
  data: {
    result: CatalogProduct[];
    meta: {
      page: number;
      pageSize: number;
      pages: number;
      total: number;
    };
  };
};

test(
  "collection dùng API thật và sắp xếp giá tăng dần không trả 400",
  { tag: "@fullstack" },
  async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const catalogResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === "GET" &&
        url.pathname === "/api/v1/storefront/products" &&
        url.searchParams.get("sort") === "price-asc" &&
        url.searchParams.get("page") === "1"
      );
    });

    await page.goto("/collection?sort=price-asc&page=1");

    const catalogResponse = await catalogResponsePromise;
    const responseBody = await catalogResponse.text();
    expect(catalogResponse.status(), responseBody).toBe(200);
    const payload = JSON.parse(responseBody) as StorefrontCatalogEnvelope;
    expect(payload.data.meta.page).toBe(1);
    expect(
      payload.data.result.length,
      "Dữ liệu test phải có ít nhất một sản phẩm ACTIVE",
    ).toBeGreaterThan(0);

    const effectivePrices = payload.data.result.map(
      (product) => product.pricing?.effectivePrice ?? product.price,
    );
    if (!effectivePrices.every((price): price is number => typeof price === "number")) {
      throw new Error("Mọi catalog product phải có effectivePrice hoặc price dạng số");
    }
    expect(effectivePrices).toEqual([...effectivePrices].sort((left, right) => left - right));

    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/collection" &&
        url.searchParams.get("sort") === "price-asc" &&
        url.searchParams.get("page") === "1",
    );
    await expect(page.getByRole("heading", { name: "Tất cả sản phẩm" })).toBeVisible();
    await expect(page.getByText("Giá: Thấp đến cao", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: payload.data.result[0].name, exact: true }),
    ).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileCatalogResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        response.request().method() === "GET" &&
        url.pathname === "/api/v1/storefront/products" &&
        url.searchParams.get("sort") === "price-asc"
      );
    });
    await page.reload();
    const mobileCatalogResponse = await mobileCatalogResponsePromise;

    expect(mobileCatalogResponse.status(), await mobileCatalogResponse.text()).toBe(200);
    await expect(page.getByRole("heading", { name: "Tất cả sản phẩm" })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
  },
);
