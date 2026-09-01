import { expect, test, type Request } from "@playwright/test";

function corsHeaders(request: Request) {
  return {
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "authorization,content-type,accept-language",
    "access-control-allow-methods": "DELETE,GET,OPTIONS,PATCH,POST,PUT",
    "access-control-allow-origin": request.headers().origin ?? "http://localhost:3000",
    "content-type": "application/json",
  };
}

function setupAdminMockRoutes(page: Parameters<Parameters<typeof test>[2]>[0]["page"]) {
  return page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const headers = corsHeaders(request);

    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }

    const pathname = new URL(request.url()).pathname;

    if (pathname === "/api/v1/auth/refresh") {
      await route.fulfill({
        status: 200,
        headers,
        json: {
          statusCode: 200,
          data: {
            accessToken: "fake-admin-token",
            refreshToken: "fake-admin-refresh-token",
            expiresIn: 900,
            tokenType: "Bearer",
          },
          message: "Success",
        },
      });
      return;
    }

    if (pathname === "/api/v1/auth/me") {
      await route.fulfill({
        status: 200,
        headers,
        json: {
          statusCode: 200,
          data: {
            id: 1,
            email: "admin@example.com",
            fullName: "Admin",
            roles: [{ id: 1, name: "ADMIN" }],
            permissions: [],
          },
          message: "Success",
        },
      });
      return;
    }

    if (pathname === "/api/v1/categories") {
      await route.fulfill({
        status: 200,
        headers,
        json: {
          statusCode: 200,
          data: {
            meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
            result: [
              {
                id: 1,
                name: "Shirts & Tops",
                slug: "shirts-tops",
                status: "ACTIVE",
                sortOrder: 1,
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          message: "OK",
        },
      });
      return;
    }

    if (pathname === "/api/v1/products") {
      await route.fulfill({
        status: 200,
        headers,
        json: {
          statusCode: 200,
          data: {
            meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
            result: [
              {
                id: 1,
                name: "Tailored Blazer",
                slug: "tailored-blazer",
                status: "ACTIVE",
                basePrice: 1500000,
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          message: "OK",
        },
      });
      return;
    }

    if (pathname === "/api/v1/brands") {
      await route.fulfill({
        status: 200,
        headers,
        json: {
          statusCode: 200,
          data: {
            meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
            result: [
              {
                id: 1,
                name: "Vela Wear Signature",
                slug: "vela-wear-signature",
                status: "ACTIVE",
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          message: "OK",
        },
      });
      return;
    }

    if (pathname === "/api/v1/coupons") {
      await route.fulfill({
        status: 200,
        headers,
        json: {
          statusCode: 200,
          data: {
            meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
            result: [
              {
                id: 1,
                code: "SUMMER2026",
                discountPercent: 15,
                status: "ACTIVE",
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          message: "OK",
        },
      });
      return;
    }

    if (pathname === "/api/v1/roles") {
      await route.fulfill({
        status: 200,
        headers,
        json: {
          statusCode: 200,
          data: {
            meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
            result: [
              {
                id: 1,
                name: "ADMIN",
                description: "Full system administration",
                status: "ACTIVE",
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          message: "OK",
        },
      });
      return;
    }

    if (pathname === "/api/v1/users") {
      await route.fulfill({
        status: 200,
        headers,
        json: {
          statusCode: 200,
          data: {
            meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
            result: [
              {
                id: 1,
                email: "staff@example.com",
                fullName: "Staff Member",
                status: "ACTIVE",
                roles: [{ id: 2, name: "STAFF" }],
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          message: "OK",
        },
      });
      return;
    }

    // Default fallback for other endpoints
    await route.fulfill({
      status: 200,
      headers,
      json: {
        statusCode: 200,
        data: {
          meta: { page: 1, pageSize: 10, pages: 0, total: 0 },
          result: [],
        },
        message: "OK",
      },
    });
  });
}

test(
  "admin shell navigates across management screens (products, categories, brands, coupons, roles, users)",
  { tag: "@smoke" },
  async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await setupAdminMockRoutes(page);

    const screens = [
      "/dashboard/products",
      "/dashboard/categories",
      "/dashboard/brands",
      "/dashboard/coupons",
      "/dashboard/roles",
      "/dashboard/users",
    ];

    for (const screenPath of screens) {
      await page.goto(screenPath, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(new RegExp(screenPath));

      // Assert table container or main content is rendered
      const mainContent = page.locator("main, [data-slot='sidebar-inset']");
      await expect(mainContent).toBeVisible();
    }

    expect(consoleErrors, "Navigation across admin screens encountered console errors").toEqual([]);
    expect(pageErrors, "Navigation across admin screens encountered page errors").toEqual([]);
  },
);

test(
  "admin theme switcher toggles dark and light mode across route transitions",
  { tag: "@smoke" },
  async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await setupAdminMockRoutes(page);

    await page.goto("/dashboard/products", { waitUntil: "domcontentloaded" });
    const htmlElement = page.locator("html");

    const themeSwitcherBtn = page.getByRole("button", { name: /giao diện|theme/i });
    await expect(themeSwitcherBtn).toBeVisible();

    // Toggle to Dark Mode
    await themeSwitcherBtn.click();
    await expect(htmlElement).toHaveAttribute("data-theme-mode", "dark");
    await expect(htmlElement).toHaveClass(/dark/);

    // Navigate to Categories in Dark Mode
    await page.goto("/dashboard/categories", { waitUntil: "domcontentloaded" });
    await expect(htmlElement).toHaveAttribute("data-theme-mode", "dark");

    // Toggle back to Light Mode
    const themeSwitcherBtnCategories = page.getByRole("button", { name: /giao diện|theme/i });
    await themeSwitcherBtnCategories.click();
    await expect(htmlElement).toHaveAttribute("data-theme-mode", "light");
    await expect(htmlElement).not.toHaveClass(/dark/);

    expect(consoleErrors, "Theme switcher encountered console errors").toEqual([]);
    expect(pageErrors, "Theme switcher encountered page errors").toEqual([]);
  },
);

test(
  "admin centered modal dialogs open and close cleanly on management screens",
  { tag: "@smoke" },
  async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await setupAdminMockRoutes(page);

    const dialogScreens = [
      { path: "/dashboard/categories", buttonName: /thêm danh mục|create category|add category/i },
      { path: "/dashboard/brands", buttonName: /thêm thương hiệu|create brand|add brand/i },
      { path: "/dashboard/coupons", buttonName: /thêm mã giảm giá|create coupon|add coupon/i },
    ];

    for (const { path, buttonName } of dialogScreens) {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const openButton = page.getByRole("button", { name: buttonName });
      if (await openButton.isVisible()) {
        await openButton.click();

        const modalDialog = page.getByRole("dialog");
        await expect(modalDialog).toBeVisible();

        const cancelButton = modalDialog.getByRole("button", { name: /hủy|cancel/i });
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();

        await expect(modalDialog).not.toBeVisible();
      }
    }

    expect(consoleErrors, "Modal dialogs encountered console errors").toEqual([]);
    expect(pageErrors, "Modal dialogs encountered page errors").toEqual([]);
  },
);
