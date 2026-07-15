import {
  expect,
  test as base,
  type Request,
  type Route,
} from "@playwright/test";

type SmokeFixtures = {
  guestApi: void;
};

const emptyPage = {
  meta: { page: 1, pageSize: 10, pages: 0, total: 0 },
  result: [],
};

function corsHeaders(request: Request) {
  return {
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "authorization,content-type,accept-language",
    "access-control-allow-methods": "DELETE,GET,OPTIONS,PATCH,POST,PUT",
    "access-control-allow-origin": request.headers().origin ?? "http://localhost:3000",
    "content-type": "application/json",
  };
}

async function fulfillGuestApi(route: Route, unexpectedApiRequests: string[]) {
  const request = route.request();
  const headers = corsHeaders(request);

  if (request.method() === "OPTIONS") {
    await route.fulfill({ status: 204, headers });
    return;
  }

  const pathname = new URL(request.url()).pathname;

  if (pathname === "/api/v1/auth/refresh") {
    await route.fulfill({
      status: 401,
      headers,
      json: {
        statusCode: 401,
        message: "Anonymous smoke session",
        data: null,
        code: "UNAUTHORIZED",
      },
    });
    return;
  }

  if (
    pathname === "/api/v1/products" ||
    pathname === "/api/v1/categories" ||
    pathname === "/api/v1/colors" ||
    pathname === "/api/v1/sizes" ||
    pathname === "/api/v1/product-variants"
  ) {
    await route.fulfill({
      status: 200,
      headers,
      json: { statusCode: 200, message: "OK", data: emptyPage },
    });
    return;
  }

  if (pathname === "/api/v1/sales") {
    await route.fulfill({
      status: 200,
      headers,
      json: {
        statusCode: 200,
        message: "OK",
        data: {
          serverTime: "2026-01-01T00:00:00Z",
          campaigns: [],
        },
      },
    });
    return;
  }

  unexpectedApiRequests.push(`${request.method()} ${pathname}`);
  await route.fulfill({
    status: 404,
    headers,
    json: {
      statusCode: 404,
      message: `No smoke mock for ${pathname}`,
      data: null,
      code: "NOT_FOUND",
    },
  });
}

export const test = base.extend<SmokeFixtures>({
  guestApi: [
    async ({ page }, use) => {
      const pageErrors: string[] = [];
      const unexpectedApiRequests: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await page.route("**/api/v1/**", (route) =>
        fulfillGuestApi(route, unexpectedApiRequests)
      );

      await use();

      expect(pageErrors, "Smoke page emitted an uncaught JavaScript error").toEqual([]);
      expect(
        unexpectedApiRequests,
        "Smoke page called an API endpoint without an explicit mock",
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
