import type { BrowserContext, Page, Request, Response, Route } from "@playwright/test";

import {
  expect,
  fullstackApiUrl,
  loginFullstackUser,
  loginFullstackSecondUser,
  test,
} from "../fixtures/fullstack";
import { ProfilePage } from "../pages/profile.page";

const refreshCookieName = "refresh_token";

type TokenEnvelope = {
  data: {
    accessToken: string;
  };
};

function isApiCall(url: string, method: string, pathname: string) {
  return method === "POST" && new URL(url).pathname === pathname;
}

function isMeCall(url: string, method: string) {
  return method === "GET" && new URL(url).pathname === "/api/v1/auth/me";
}

async function getRefreshCookie(context: BrowserContext) {
  const cookies = await context.cookies(`${fullstackApiUrl}/auth/refresh`);
  return cookies.find((cookie) => cookie.name === refreshCookieName);
}

function getCookieHeaderValue(cookieHeader: string | null, cookieName: string) {
  return cookieHeader?.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`))?.[1];
}

async function getAuthSessionLockCount(page: Page) {
  return page.evaluate(async () => {
    const snapshot = await navigator.locks.query();
    const lockName = "vela-auth-session";
    const held = snapshot.held?.filter((lock) => lock.name === lockName).length ?? 0;
    const pending = snapshot.pending?.filter((lock) => lock.name === lockName).length ?? 0;
    return held + pending;
  });
}

test(
  "hard reload refresh đúng một lần và giữ nguyên phiên đăng nhập",
  { tag: "@fullstack" },
  async ({ authenticatedSession, context, page }) => {
    const profilePage = new ProfilePage(page);
    let countRefreshRequests: ((request: Request) => void) | undefined;

    try {
      const { meResponse: bootstrapMe, refreshResponse: bootstrapRefresh } =
        await profilePage.gotoAndWaitForBootstrap();

      expect(bootstrapRefresh.status()).toBe(200);
      expect(bootstrapMe.status()).toBe(200);
      await expect(profilePage.authHeader.profileLink).toBeVisible();

      const cookieBeforeReload = await getRefreshCookie(context);
      expect(cookieBeforeReload).toBeTruthy();

      let refreshRequestCount = 0;
      countRefreshRequests = (request: Request) => {
        if (isApiCall(request.url(), request.method(), "/api/v1/auth/refresh")) {
          refreshRequestCount += 1;
        }
      };
      page.on("request", countRefreshRequests);

      const [refreshResponse, meResponse] = await Promise.all([
        page.waitForResponse((response) =>
          isApiCall(response.url(), response.request().method(), "/api/v1/auth/refresh"),
        ),
        page.waitForResponse((response) => isMeCall(response.url(), response.request().method())),
        page.reload({ waitUntil: "domcontentloaded" }),
      ]);

      expect(refreshResponse.status()).toBe(200);
      expect(meResponse.status()).toBe(200);
      const refreshBody = (await refreshResponse.json()) as TokenEnvelope;
      expect(refreshBody.data.accessToken).toBeTruthy();
      authenticatedSession.setCleanupAccessToken(refreshBody.data.accessToken);

      const cookieAfterReload = await getRefreshCookie(context);
      expect(cookieAfterReload).toBeTruthy();
      expect(cookieAfterReload!.value).not.toBe(cookieBeforeReload!.value);
      await expect(profilePage.authHeader.profileLink).toBeVisible();

      // Quan sát một khoảng yên tĩnh có giới hạn để bắt refresh thứ hai đến muộn.
      await expect(
        page.waitForRequest(
          (request) => isApiCall(request.url(), request.method(), "/api/v1/auth/refresh"),
          { timeout: 500 },
        ),
      ).rejects.toThrow();
      expect(refreshRequestCount).toBe(1);
    } finally {
      if (countRefreshRequests) page.off("request", countRefreshRequests);
    }
  },
);

test(
  "hai tab bootstrap đồng thời tuần tự hóa refresh và đều giữ phiên đăng nhập",
  { tag: "@fullstack" },
  async ({ authenticatedSession, context }) => {
    const firstPage = await context.newPage();
    const secondPage = await context.newPage();
    const firstProfilePage = new ProfilePage(firstPage);
    const secondProfilePage = new ProfilePage(secondPage);
    let activeRefreshRequests = 0;
    let maxConcurrentRefreshRequests = 0;
    const refreshStatuses: number[] = [];
    const refreshRequestCookies: Array<string | null> = [];
    let releaseFirstRefresh: () => void = () => undefined;
    const firstRefreshGate = new Promise<void>((resolve) => {
      releaseFirstRefresh = resolve;
    });
    let cookieBeforeBootstrap: Awaited<ReturnType<typeof getRefreshCookie>>;

    const gateRefreshRequest = async (route: Route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      activeRefreshRequests += 1;
      const requestNumber = refreshRequestCookies.length + 1;
      refreshRequestCookies.push(await route.request().headerValue("cookie"));
      maxConcurrentRefreshRequests = Math.max(maxConcurrentRefreshRequests, activeRefreshRequests);
      try {
        if (requestNumber === 1) await firstRefreshGate;
        const upstreamResponse = await route.fetch();
        refreshStatuses.push(upstreamResponse.status());
        await route.fulfill({ response: upstreamResponse });
      } finally {
        activeRefreshRequests -= 1;
      }
    };

    try {
      await test.step("Chuẩn bị cookie và barrier cho refresh", async () => {
        expect(authenticatedSession.accessToken).toBeTruthy();

        cookieBeforeBootstrap = await getRefreshCookie(context);
        expect(cookieBeforeBootstrap).toBeTruthy();

        await context.route("**/api/v1/auth/refresh", gateRefreshRequest);
      });

      await test.step("Đưa refresh tab thứ hai vào hàng đợi Web Lock", async () => {
        await firstProfilePage.goto();
        await expect.poll(() => refreshRequestCookies.length).toBe(1);

        await secondProfilePage.goto();
        await expect
          .poll(() =>
            secondPage.evaluate(async () => {
              const snapshot = await navigator.locks.query();
              return snapshot.pending?.some((lock) => lock.name === "vela-auth-session") ?? false;
            }),
          )
          .toBe(true);

        expect(refreshRequestCookies).toHaveLength(1);
      });

      await test.step("Nhả barrier và xác nhận hai tab refresh tuần tự", async () => {
        releaseFirstRefresh();

        await Promise.all([
          expect(firstProfilePage.authHeader.profileLink).toBeVisible(),
          expect(secondProfilePage.authHeader.profileLink).toBeVisible(),
        ]);

        expect(await firstPage.evaluate(() => Boolean(navigator.locks))).toBe(true);
        expect(await secondPage.evaluate(() => Boolean(navigator.locks))).toBe(true);
        expect(refreshStatuses).toEqual([200, 200]);
        expect(refreshRequestCookies).toHaveLength(2);
        expect(refreshRequestCookies[0]).toContain(`refresh_token=${cookieBeforeBootstrap!.value}`);
        expect(refreshRequestCookies[1]).not.toBe(refreshRequestCookies[0]);
        expect(maxConcurrentRefreshRequests).toBe(1);

        const cookieAfterBootstrap = await getRefreshCookie(context);
        expect(cookieAfterBootstrap).toBeTruthy();
        expect(cookieAfterBootstrap!.value).not.toBe(cookieBeforeBootstrap!.value);
      });
    } finally {
      releaseFirstRefresh();
      try {
        await expect
          .poll(
            async () => ({
              activeRequests: activeRefreshRequests,
              activeLocks: await getAuthSessionLockCount(firstPage),
            }),
            { timeout: 5_000 },
          )
          .toEqual({ activeRequests: 0, activeLocks: 0 });
        await context.unroute("**/api/v1/auth/refresh", gateRefreshRequest);
      } finally {
        await Promise.allSettled([firstPage.close(), secondPage.close()]);
      }
    }
  },
);

test(
  "logout chờ refresh tab khác và là thao tác ghi cookie cuối cùng",
  { tag: "@fullstack" },
  async ({ authenticatedSession, context, page, request }) => {
    const profilePage = new ProfilePage(page);
    const refreshPage = await context.newPage();
    const refreshProfilePage = new ProfilePage(refreshPage);
    const authMutationPattern = /\/api\/v1\/auth\/(?:refresh|logout)$/;
    let activeSessionMutations = 0;
    let maxConcurrentSessionMutations = 0;
    let refreshRequestCount = 0;
    let logoutRequestCount = 0;
    let refreshRequestCookie: string | null = null;
    let logoutRequestCookie: string | null = null;
    const sessionResponses: Array<{ pathname: string; status: number }> = [];
    let releaseRefresh: () => void = () => undefined;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });
    let logoutResponsePromise: Promise<Response> | undefined;

    const gateAuthMutation = async (route: Route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      const pathname = new URL(route.request().url()).pathname;
      activeSessionMutations += 1;
      maxConcurrentSessionMutations = Math.max(
        maxConcurrentSessionMutations,
        activeSessionMutations,
      );
      try {
        if (pathname.endsWith("/refresh")) {
          refreshRequestCount += 1;
          refreshRequestCookie = await route.request().headerValue("cookie");
          if (refreshRequestCount === 1) await refreshGate;
        } else {
          logoutRequestCount += 1;
          logoutRequestCookie = await route.request().headerValue("cookie");
        }

        const upstreamResponse = await route.fetch();
        sessionResponses.push({ pathname, status: upstreamResponse.status() });
        await route.fulfill({ response: upstreamResponse });
      } finally {
        activeSessionMutations -= 1;
      }
    };

    try {
      const cookieBeforeRace =
        await test.step("Bootstrap profile và cài barrier session", async () => {
          expect(authenticatedSession.accessToken).toBeTruthy();

          const { meResponse: bootstrapMe, refreshResponse: bootstrapRefresh } =
            await profilePage.gotoAndWaitForBootstrap();

          expect(bootstrapRefresh.status()).toBe(200);
          expect(bootstrapMe.status()).toBe(200);
          await expect(profilePage.authHeader.profileLink).toBeVisible();

          const cookie = await getRefreshCookie(context);
          expect(cookie).toBeTruthy();

          await context.route(authMutationPattern, gateAuthMutation);
          return cookie;
        });

      await test.step("Giữ refresh và đưa logout vào hàng đợi Web Lock", async () => {
        await refreshProfilePage.goto();
        await expect.poll(() => refreshRequestCount).toBe(1);

        await profilePage.authHeader.profileLink.hover();
        logoutResponsePromise = page.waitForResponse((response) =>
          isApiCall(response.url(), response.request().method(), "/api/v1/auth/logout"),
        );
        await profilePage.authHeader.logoutButton.click();

        await expect
          .poll(() =>
            page.evaluate(async () => {
              const snapshot = await navigator.locks.query();
              const lockName = "vela-auth-session";
              return {
                held: snapshot.held?.filter((lock) => lock.name === lockName).length ?? 0,
                pending: snapshot.pending?.filter((lock) => lock.name === lockName).length ?? 0,
              };
            }),
          )
          .toEqual({ held: 1, pending: 1 });

        expect(logoutRequestCount).toBe(0);
        expect(maxConcurrentSessionMutations).toBe(1);
      });

      await test.step("Nhả refresh và xác nhận logout ghi cookie cuối cùng", async () => {
        releaseRefresh();

        const logoutResponse = await logoutResponsePromise!;
        expect(logoutResponse.status()).toBe(200);
        await expect.poll(() => activeSessionMutations).toBe(0);

        expect(sessionResponses).toEqual([
          { pathname: "/api/v1/auth/refresh", status: 200 },
          { pathname: "/api/v1/auth/logout", status: 200 },
        ]);
        expect(refreshRequestCookie).toContain(`refresh_token=${cookieBeforeRace!.value}`);
        expect(logoutRequestCookie).not.toBe(refreshRequestCookie);
        expect(maxConcurrentSessionMutations).toBe(1);
        await expect.poll(async () => getRefreshCookie(context)).toBeUndefined();
        await expect(profilePage.authHeader.loginLink).toBeVisible();
      });

      await test.step("Xác nhận refresh token đã logout không thể replay", async () => {
        const replayToken = getCookieHeaderValue(logoutRequestCookie, refreshCookieName);
        expect(replayToken).toBeTruthy();

        const replayAfterLogout = await request.post(`${fullstackApiUrl}/auth/refresh`, {
          data: { refreshToken: replayToken },
        });
        expect(replayAfterLogout.status()).toBe(401);
      });
    } finally {
      releaseRefresh();
      try {
        await expect
          .poll(
            async () => ({
              activeRequests: activeSessionMutations,
              activeLocks: await getAuthSessionLockCount(page),
            }),
            { timeout: 5_000 },
          )
          .toEqual({ activeRequests: 0, activeLocks: 0 });
        await context.unroute(authMutationPattern, gateAuthMutation);
      } finally {
        await Promise.allSettled([refreshPage.close()]);
      }
    }
  },
);

test(
  "logout xóa cookie và refresh token cũ không thể dùng lại",
  { tag: "@fullstack" },
  async ({ authenticatedSession, context, page, request }) => {
    const profilePage = new ProfilePage(page);
    const { meResponse: bootstrapMe, refreshResponse: bootstrapRefresh } =
      await profilePage.gotoAndWaitForBootstrap();

    expect(authenticatedSession.accessToken).toBeTruthy();
    expect(bootstrapRefresh.status()).toBe(200);
    expect(bootstrapMe.status()).toBe(200);

    const bootstrapBody = (await bootstrapRefresh.json()) as TokenEnvelope;
    expect(bootstrapBody.data.accessToken).toBeTruthy();

    const activeRefreshCookie = await getRefreshCookie(context);
    expect(activeRefreshCookie).toBeTruthy();
    await expect(profilePage.authHeader.profileLink).toBeVisible();

    await profilePage.authHeader.profileLink.hover();
    const logoutResponsePromise = page.waitForResponse((response) =>
      isApiCall(response.url(), response.request().method(), "/api/v1/auth/logout"),
    );
    await profilePage.authHeader.logoutButton.click();

    const logoutResponse = await logoutResponsePromise;
    expect(logoutResponse.ok()).toBeTruthy();
    expect(await logoutResponse.request().headerValue("authorization")).toBe(
      `Bearer ${bootstrapBody.data.accessToken}`,
    );

    await expect.poll(async () => getRefreshCookie(context)).toBeUndefined();
    await expect(profilePage.authHeader.loginLink).toBeVisible();

    const refreshWithoutCookie = await context.request.post(`${fullstackApiUrl}/auth/refresh`, {
      data: {},
    });
    expect(refreshWithoutCookie.status()).toBe(401);

    const replayOldToken = await request.post(`${fullstackApiUrl}/auth/refresh`, {
      data: { refreshToken: activeRefreshCookie!.value },
    });
    expect(replayOldToken.status()).toBe(401);

    const replayAccessToken = await request.get(`${fullstackApiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${bootstrapBody.data.accessToken}` },
    });
    expect(replayAccessToken.status()).toBe(401);
  },
);

test(
  "cart ownership survives account transitions",
  { tag: "@fullstack" },
  async ({ context, page, request }) => {
    // 1. Fetch real variant ID
    const variantsResponse = await request.get(
      `${fullstackApiUrl}/product-variants?sku=VW-TEE-BLK-M&size=100`,
    );
    const variantsBody = (await variantsResponse.json()) as {
      data: { result: Array<{ sku: string; id: number }> };
    };
    const variantId = variantsBody.data.result.find((i) => i.sku === "VW-TEE-BLK-M")!.id;

    // 2. Guest cart
    await page.goto("/");
    await page.evaluate((vid) => {
      localStorage.setItem(
        "vela-cart-v1",
        JSON.stringify({
          state: {
            cart: [{ id: `variant-${vid}`, variantId: vid, quantity: 1, price: 100, name: "Test" }],
            owner: "anonymous",
          },
          version: 0,
        }),
      );
    }, variantId);

    // 3. Login A and sync
    await loginFullstackUser(context.request);
    await page.reload();

    // Wait for the sync request
    const syncReqA = await page.waitForResponse(
      (res) =>
        res.request().method() === "PUT" &&
        new URL(res.url()).pathname === "/api/v1/carts/me/items",
    );
    expect(syncReqA.status()).toBe(200);

    // 4. Logout A via UI
    const profilePage = new ProfilePage(page);
    await profilePage.gotoAndWaitForBootstrap();
    await profilePage.authHeader.profileLink.hover();
    await profilePage.authHeader.logoutButton.click();
    await expect(profilePage.authHeader.loginLink).toBeVisible();

    // 5. Login B and check
    const accessTokenB = await loginFullstackSecondUser(context.request);
    await page.reload();

    const cartRes = await context.request.get(`${fullstackApiUrl}/carts/me`, {
      headers: { Authorization: `Bearer ${accessTokenB}` },
    });
    const cartBody = (await cartRes.json()) as { data: { items: Array<{ variantId: number }> } };

    // B's cart shouldn't sync A's item.
    const hasVariantId = cartBody.data.items?.some((i) => i.variantId === variantId);
    expect(hasVariantId).toBeFalsy();
  },
);
