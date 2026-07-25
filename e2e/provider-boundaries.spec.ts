import { test, expect, type Request, type Route } from "@playwright/test";

function corsHeaders(request: Request) {
  return {
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "authorization,content-type,accept-language",
    "access-control-allow-methods": "DELETE,GET,OPTIONS,PATCH,POST,PUT",
    "access-control-allow-origin": request.headers().origin ?? "http://localhost:3000",
    "content-type": "application/json",
  };
}

test("authenticated admin performs no shop data request", { tag: "@smoke" }, async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const shopDataRequests: string[] = [];
  
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
      consoleErrors.push(message.text());
    }
  });
  
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.route("**/api/v1/**", async (route) => {
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
            tokenType: "Bearer"
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
            permissions: []
          },
          message: "Success",
        },
      });
      return;
    }

    if (
      pathname.includes("/carts") || 
      pathname.includes("/wishlists") || 
      pathname.includes("/favorites") || 
      pathname.includes("/notifications")
    ) {
      shopDataRequests.push(`${request.method()} ${pathname}`);
    }

    // Default fulfill for other admin requests so page renders without throwing
    await route.fulfill({
      status: 200,
      headers,
      json: {
        statusCode: 200,
        data: {
          meta: { page: 1, pageSize: 10, pages: 0, total: 0 },
          result: []
        },
        message: "OK",
      },
    });
  });

  // Navigate directly to an admin route
  await page.goto("/dashboard/default", { waitUntil: "networkidle" });
  
  // Assert admin shell rendered
  await expect(page).toHaveURL(/\/dashboard\/default/);

  // Assert no page or console errors
  expect(consoleErrors, "Admin page emitted a console error").toEqual([]);
  expect(pageErrors, "Admin page emitted an uncaught JavaScript error").toEqual([]);
  
  // Assert no shop provider data requests were made
  expect(shopDataRequests, "Admin page made shop data requests").toEqual([]);
});
