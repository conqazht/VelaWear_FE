import type { Page, Route } from "@playwright/test";

import { expect, test } from "./fixtures/smoke";

const facets = {
  categories: [{ id: 1, name: "Áo", slug: "ao", count: 4 }],
  colors: [{ id: 1, name: "Đen", hexCode: "#000000", sortOrder: 1, count: 4 }],
  sizes: [{ id: 3, name: "M", sortOrder: 3, count: 4 }],
  priceRange: { min: 450_000, max: 1_250_000 },
};

const product = {
  id: 101,
  categoryId: 1,
  categoryName: "Áo",
  categorySlug: "ao",
  name: "Áo linen kiểm thử",
  slug: "ao-linen-kiem-thu",
  description: "Sản phẩm dùng cho Playwright smoke.",
  price: 950_000,
  thumbnail: "/images/products/product-placeholder.webp",
  status: "ACTIVE",
};

function apiHeaders(route: Route) {
  return {
    "access-control-allow-credentials": "true",
    "access-control-allow-origin": route.request().headers().origin ?? "http://localhost:3000",
    "content-type": "application/json",
  };
}

async function fulfillCatalog(route: Route, total = 1) {
  await route.fulfill({
    status: 200,
    headers: apiHeaders(route),
    json: {
      statusCode: 200,
      message: "OK",
      data: {
        result: total > 0 ? [product] : [],
        meta: { page: 1, pageSize: 12, pages: total > 0 ? 1 : 0, total },
        facets,
      },
    },
  });
}

async function openDesktopFilters(page: Page) {
  await page.getByRole("button", { name: "Hiện bộ lọc" }).click();
  await expect(page.getByRole("button", { name: "Danh mục" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
}

async function expectNoHorizontalOverflow(page: Page) {
  const offenders = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    return Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) > 0 &&
          rect.width > 0 &&
          (rect.left < -1 || rect.right > viewportWidth + 1)
        );
      })
      .slice(0, 8)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          className: element.className.toString().slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          tag: element.tagName,
        };
      });
  });
  expect(offenders, "Trang không được tràn ngang viewport").toEqual([]);
}

test(
  "mega-menu tách parent link và leaf link thật trên desktop/mobile",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route("**/api/v1/storefront/products**", (route) => fulfillCatalog(route, 0));
    await page.goto("/collection");

    await expectNoHorizontalOverflow(page);
    const desktopNavigation = page.locator('[data-slot="navigation-menu"]');
    await expect(desktopNavigation).toBeVisible();
    const desktopMenus = [
      { parent: "Giảm giá", leaf: "Flash Sale" },
      { parent: "Bộ sưu tập", leaf: "May đo" },
      { parent: "Áo", leaf: "Cardigan" },
      { parent: "Quần", leaf: "Cargo" },
      { parent: "Váy & Đầm", leaf: "Jumpsuit" },
      { parent: "Phụ kiện & Giày", leaf: "Móc khóa" },
    ];

    for (const menu of desktopMenus) {
      const navLink = desktopNavigation
        .locator('[data-slot="navigation-menu-trigger"]')
        .filter({ hasText: menu.parent });
      await navLink.hover({ force: true });
      await expect(page.getByRole("link", { name: menu.leaf, exact: true })).toBeVisible();
    }

    const topsLink = desktopNavigation
      .locator('[data-slot="navigation-menu-trigger"]')
      .filter({ hasText: "Áo" });
    await topsLink.hover({ force: true });

    const cardiganLink = page.getByRole("link", { name: "Cardigan", exact: true });
    for (let transition = 0; transition < 4; transition += 1) {
      await topsLink.hover({ force: true });
      await page.waitForTimeout(140);
      expect(await cardiganLink.isVisible()).toBe(true);
    }

    await page.getByRole("heading", { name: "Tất cả sản phẩm" }).hover({ force: true });
    await topsLink.hover({ force: true });

    const labelBox = await topsLink.locator('[data-slot="storefront-nav-label"]').boundingBox();
    expect(labelBox).not.toBeNull();
    await expect(topsLink).toHaveAttribute("href", /categories=ao%2Cao-khoac/);
    await expectNoHorizontalOverflow(page);

    const dressesLink = desktopNavigation
      .locator('[data-slot="navigation-menu-trigger"]')
      .filter({ hasText: "Váy & Đầm" });
    await dressesLink.hover({ force: true });
    const compactPanel = page
      .locator('[data-slot="storefront-mega-menu-panel"]')
      .filter({ hasText: "Váy & Đầm" });
    await expect(compactPanel).toBeVisible();
    const compactPanelBox = await compactPanel.boundingBox();
    expect(compactPanelBox).not.toBeNull();
    expect(compactPanelBox!.width).toBeLessThanOrEqual(801);
    expect(compactPanelBox!.height).toBeLessThanOrEqual(310);
    await expectNoHorizontalOverflow(page);

    await page.keyboard.press("Escape");
    const collectionMenu = desktopNavigation
      .locator('[data-slot="navigation-menu-trigger"]')
      .filter({ hasText: "Bộ sưu tập" });
    await collectionMenu.hover({ force: true });
    const newArrivals = page.getByRole("link", { name: "Mới về", exact: true });
    await expect(newArrivals).toBeVisible();
    await newArrivals.click();
    await expect(page).toHaveURL(
      (url) => url.pathname === "/collection" && url.searchParams.get("sort") === "newest",
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/collection");
    await page.getByRole("button", { name: "Mở menu" }).click();
    await expectNoHorizontalOverflow(page);
    const shirtsMenu = page.getByRole("button", { name: "Áo menu" });
    await shirtsMenu.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("link", { name: "Áo thun", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Áo thun", exact: true }).click();
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/collection" &&
        url.searchParams.get("categories") === "ao" &&
        url.searchParams.get("q") === "áo thun",
    );
  },
);

test(
  "catalog khôi phục multi-filter và sort giá từ URL sau reload",
  { tag: "@smoke" },
  async ({ page }) => {
    const requests: URL[] = [];
    await page.route("**/api/v1/storefront/products**", async (route) => {
      requests.push(new URL(route.request().url()));
      await fulfillCatalog(route);
    });

    await page.goto("/collection?categories=ao&colors=1&sizes=3&sort=price-asc&page=1");

    await expect(page.getByRole("heading", { name: "Tất cả sản phẩm" })).toBeVisible();
    await expect(page.getByLabel("Đang lọc").getByRole("button", { name: /Áo/ })).toBeVisible();
    await expect(page.getByLabel("Đang lọc").getByRole("button", { name: /Đen/ })).toBeVisible();
    await expect(page.getByLabel("Đang lọc").getByRole("button", { name: /M/ })).toBeVisible();
    await expect(page.getByText("Giá: Thấp đến cao", { exact: true })).toBeVisible();

    await expect.poll(() => requests.at(-1)?.searchParams.get("sort")).toBe("price-asc");
    expect(requests.at(-1)?.searchParams.get("categorySlugs")).toBe("ao");
    expect(requests.at(-1)?.searchParams.get("colorIds")).toBe("1");
    expect(requests.at(-1)?.searchParams.get("sizeIds")).toBe("3");

    await page.reload();
    await expect(page).toHaveURL(/categories=ao/);
    await expect(page.getByLabel("Đang lọc").getByRole("button", { name: /Đen/ })).toBeVisible();
  },
);

test("mobile giữ bộ lọc nháp đến khi bấm Xem N sản phẩm", { tag: "@smoke" }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/v1/storefront/products**", async (route) => {
    const url = new URL(route.request().url());
    await fulfillCatalog(route, url.searchParams.get("colorIds") === "1" ? 3 : 8);
  });

  await page.goto("/collection");
  await page.getByRole("button", { name: "Bộ lọc" }).click();
  const dialog = page.getByRole("dialog", { name: "Bộ lọc" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: /Đen/ }).click();
  await expect(page).not.toHaveURL(/colors=1/);
  await dialog.getByRole("button", { name: "Xem 3 sản phẩm" }).click();

  await expect(page).toHaveURL(/colors=1/);
  await expect(dialog).toBeHidden();
});

test("initial 500 giữ artwork đến khi Retry thành công", { tag: "@smoke" }, async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/v1/storefront/products**", async (route) => {
    attempts += 1;
    if (attempts <= 2) {
      await route.fulfill({
        status: 500,
        headers: apiHeaders(route),
        json: { statusCode: 500, message: "Temporary test failure", data: null },
      });
      return;
    }
    await fulfillCatalog(route, 0);
  });

  await page.goto("/collection");
  await expect(page.getByRole("heading", { name: "Có một nhịp ngắt quãng" })).toBeVisible();
  await expect.poll(() => attempts).toBe(2);

  await page.getByRole("button", { name: "Thử lại" }).click();
  await expect(page.getByRole("heading", { name: "Tất cả sản phẩm" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Có một nhịp ngắt quãng" })).toHaveCount(0);
  expect(attempts).toBe(3);
});

test(
  "initial 400 dùng notice gọn và đặt lại query thay vì Retry",
  { tag: "@smoke" },
  async ({ page }) => {
    let attempts = 0;
    await page.route("**/api/v1/storefront/products**", async (route) => {
      attempts += 1;
      const url = new URL(route.request().url());
      if (url.searchParams.has("minPrice")) {
        await route.fulfill({
          status: 400,
          headers: apiHeaders(route),
          json: { statusCode: 400, message: "Invalid catalog request", data: null },
        });
        return;
      }
      await fulfillCatalog(route);
    });

    await page.goto("/collection?minPrice=999999999");
    await expect(page.getByRole("heading", { name: "Kiểm tra lại thông tin" })).toBeVisible();
    await expect(page.getByText("Vela Wear / HTTP 400")).toBeVisible();
    await expect(page.getByRole("button", { name: "Thử lại" })).toHaveCount(0);
    await expect.poll(() => attempts).toBe(1);

    await page.getByRole("link", { name: "Xem tất cả sản phẩm" }).click();
    await expect(page).toHaveURL((url) => url.pathname === "/collection" && url.search === "");
    await expect(page.getByRole("heading", { name: "Tất cả sản phẩm" })).toBeVisible();
    expect(attempts).toBe(2);
  },
);

test("filter lỗi quay về URL hợp lệ và giữ grid đã có", { tag: "@smoke" }, async ({ page }) => {
  await page.route("**/api/v1/storefront/products**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.has("categorySlugs")) {
      await route.fulfill({
        status: 500,
        headers: apiHeaders(route),
        json: { statusCode: 500, message: "Filter test failure", data: null },
      });
      return;
    }
    await fulfillCatalog(route);
  });

  await page.goto("/collection");
  await expect(page.getByRole("heading", { name: "Áo linen kiểm thử" })).toBeVisible();
  await openDesktopFilters(page);
  await page.getByRole("checkbox", { name: /Áo/ }).click();

  await expect(page).toHaveURL((url) => !url.searchParams.has("categories"));
  await expect(page.getByRole("heading", { name: "Áo linen kiểm thử" })).toBeVisible();
});

test(
  "filter 400 giữ grid và không đề nghị Retry request sai",
  { tag: "@smoke" },
  async ({ page }) => {
    let invalidFilterAttempts = 0;
    await page.route("**/api/v1/storefront/products**", async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.has("categorySlugs")) {
        invalidFilterAttempts += 1;
        await route.fulfill({
          status: 400,
          headers: apiHeaders(route),
          json: { statusCode: 400, message: "Invalid filter", data: null },
        });
        return;
      }
      await fulfillCatalog(route);
    });

    await page.goto("/collection");
    await expect(page.getByRole("heading", { name: "Áo linen kiểm thử" })).toBeVisible();
    await openDesktopFilters(page);
    await page.getByRole("checkbox", { name: /Áo/ }).click();

    await expect.poll(() => invalidFilterAttempts).toBe(1);
    await expect(page).toHaveURL((url) => !url.searchParams.has("categories"));
    await expect(page.getByRole("heading", { name: "Áo linen kiểm thử" })).toBeVisible();
    const warning = page.getByRole("status");
    await expect(warning).toContainText("Bộ lọc vừa chọn không hợp lệ");
    await expect(warning).toContainText("HTTP 400");
    await expect(warning.getByRole("button", { name: "Thử lại" })).toHaveCount(0);
  },
);

test(
  "size guide đổi cm/in và chọn bảng cỡ mở rộng plus-size",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("/size-guide?category=ao&size=M&product=ao-linen-kiem-thu&available=M,L");

    await expect(page.getByRole("heading", { name: "Hướng dẫn chọn cỡ" })).toBeVisible();
    await expect(page.getByRole("button", { name: "cm" }).first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: "in" }).first().click();
    await expect(page.getByRole("button", { name: "in" }).first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const plusTab = page.getByRole("button", { name: /Cỡ mở rộng/i });
    await plusTab.click();
    await expect(page.getByRole("heading", { name: "Bảng kích cỡ mở rộng 0X – 4X" })).toBeVisible();
  },
);

test(
  "PDP rút gọn 3 review và modal phân trang server-side có lightbox",
  { tag: "@smoke" },
  async ({ page }) => {
    const reviewRequests: URL[] = [];
    const longComment = "Chất liệu mềm, đường may đẹp và form mặc thoải mái trong cả ngày. ".repeat(
      4,
    );
    await page.route("**/api/v1/products/slug/ao-linen-kiem-thu**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: apiHeaders(route),
        json: { statusCode: 200, message: "OK", data: product },
      });
    });
    await page.route("**/api/v1/reviews/product/101/summary", async (route) => {
      await route.fulfill({
        status: 200,
        headers: apiHeaders(route),
        json: {
          statusCode: 200,
          message: "OK",
          data: { total: 37, averageRating: 3.3, ratingCounts: { 1: 2, 2: 5, 3: 12, 4: 10, 5: 8 } },
        },
      });
    });
    await page.route("**/api/v1/reviews/product/101?**", async (route) => {
      const url = new URL(route.request().url());
      reviewRequests.push(url);
      const requestedSize = Number(url.searchParams.get("size") ?? 10);
      const requestedPage = Number(url.searchParams.get("page") ?? 1);
      const result = Array.from({ length: requestedSize === 3 ? 3 : 2 }, (_, index) => ({
        id: requestedPage * 100 + index,
        userName: requestedPage === 2 ? `Khách trang 2-${index + 1}` : `Khách hàng ${index + 1}`,
        productId: 101,
        productName: product.name,
        productSlug: product.slug,
        variantName: "Đen / M",
        rating: index === 0 ? 5 : 4,
        comment: index === 0 ? longComment : "Sản phẩm đúng mô tả.",
        images:
          requestedSize === 10 && index === 0
            ? ["/images/fixtures/products/linen-blazer/card.webp"]
            : [],
        verifiedPurchase: true,
        createdAt: "2026-07-15T10:00:00Z",
      }));
      await route.fulfill({
        status: 200,
        headers: apiHeaders(route),
        json: {
          statusCode: 200,
          message: "OK",
          data: {
            result,
            meta: {
              page: requestedPage,
              pageSize: requestedSize,
              pages: requestedSize === 3 ? 13 : 4,
              total: 37,
            },
          },
        },
      });
    });

    await page.goto("/products/ao-linen-kiem-thu");
    await expect(page.getByRole("heading", { name: "Đánh giá (37)" })).toBeVisible();
    await expect(page.getByText("Khách hàng 1", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Xem thêm" }).first().click();
    await expect(page.getByRole("button", { name: "Thu gọn" }).first()).toBeVisible();

    await page.getByRole("button", { name: /Xem tất cả 37 đánh giá/ }).click();
    await expect(
      page.getByRole("dialog").getByRole("heading", { name: `Đánh giá về ${product.name}` }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Mở ảnh đánh giá số 1" }).click();
    await expect(page.getByRole("heading", { name: "Ảnh đánh giá" })).toBeVisible();
    await page.keyboard.press("Escape");

    await page
      .getByRole("navigation", { name: "Phân trang đánh giá" })
      .getByRole("button", { name: "2", exact: true })
      .click();
    await expect(page.getByText("Khách trang 2-1", { exact: true })).toBeVisible();
    await expect.poll(() => reviewRequests.at(-1)?.searchParams.get("page")).toBe("2");
    expect(reviewRequests.at(-1)?.searchParams.get("size")).toBe("10");
  },
);
