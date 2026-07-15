import {
  expect,
  test as base,
  type APIRequestContext,
  type Response,
} from "@playwright/test";

export const fullstackApiUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:8080/api/v1";
export const fullstackUserEmail = process.env.E2E_USER_EMAIL ?? "user@velawear.local";
export const fullstackUserPassword = process.env.E2E_USER_PASSWORD ?? "Password123!";
const variantSku = process.env.E2E_VARIANT_SKU ?? "VW-TEE-BLK-M";

type ApiEnvelope<T> = {
  data: T;
};

type LoginResponse = {
  accessToken: string;
};

type ProductVariant = {
  id: number;
  sku: string;
};

type PaginatedResult<T> = {
  result: T[];
};

type CheckoutResponse = {
  orderId: number;
};

type FullstackSession = {
  accessToken: string;
  api: APIRequestContext;
  variantId: number;
};

type AuthenticatedSession = {
  accessToken: string;
  setCleanupAccessToken: (accessToken: string) => void;
};

type FullstackFixtures = {
  authenticatedSession: AuthenticatedSession;
  fullstackSession: FullstackSession;
};

function isCheckoutResponse(response: Response) {
  const url = new URL(response.url());
  return response.request().method() === "POST" &&
    url.pathname === "/api/v1/checkout" &&
    response.status() === 201;
}

export async function loginFullstackUser(api: APIRequestContext) {
  const loginResponse = await api.post(`${fullstackApiUrl}/auth/login`, {
    data: { email: fullstackUserEmail, password: fullstackUserPassword },
  });
  expect(loginResponse.ok(), await loginResponse.text()).toBeTruthy();
  const loginBody = await loginResponse.json() as ApiEnvelope<LoginResponse>;
  expect(loginBody.data.accessToken).toBeTruthy();
  return loginBody.data.accessToken;
}

async function cleanupAuthenticatedSession(api: APIRequestContext, accessToken: string) {
  try {
    const logoutResponse = await api.post(`${fullstackApiUrl}/auth/logout`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (logoutResponse.status() === 401) {
      await api.post(`${fullstackApiUrl}/auth/logout`);
    }
  } catch {
    // Cleanup is best-effort so a stopped backend does not hide the original test result.
  }
}

export const test = base.extend<FullstackFixtures>({
  authenticatedSession: async ({ context }, provide) => {
    let cleanupAccessToken = await loginFullstackUser(context.request);

    await provide({
      accessToken: cleanupAccessToken,
      setCleanupAccessToken: (accessToken) => {
        cleanupAccessToken = accessToken;
      },
    });

    await cleanupAuthenticatedSession(context.request, cleanupAccessToken);
  },

  fullstackSession: async ({ authenticatedSession, context, page }, provide) => {
    const api = context.request;
    const { accessToken } = authenticatedSession;

    const variantsResponse = await api.get(
      `${fullstackApiUrl}/product-variants?sku=${encodeURIComponent(variantSku)}&size=100`,
    );
    expect(variantsResponse.ok(), await variantsResponse.text()).toBeTruthy();
    const variantsBody = await variantsResponse.json() as ApiEnvelope<PaginatedResult<ProductVariant>>;
    const variant = variantsBody.data.result.find((item) => item.sku === variantSku);
    expect(variant, `Missing seeded product variant ${variantSku}`).toBeTruthy();

    const cartResponse = await api.put(`${fullstackApiUrl}/carts/me/items`, {
      data: { items: [{ variantId: variant!.id, quantity: 1 }] },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(cartResponse.ok(), await cartResponse.text()).toBeTruthy();

    await page.route("https://provinces.open-api.vn/api/v2/p/", async (route) => {
      await route.fulfill({
        json: [
          {
            code: 79,
            name: "Ho Chi Minh",
            division_type: "city",
            codename: "ho_chi_minh",
          },
        ],
      });
    });
    await page.route(/https:\/\/provinces\.open-api\.vn\/api\/v2\/w\/\?province=79$/, async (route) => {
      await route.fulfill({
        json: [
          {
            code: 760,
            name: "Ben Nghe",
            division_type: "ward",
            codename: "ben_nghe",
            province_code: 79,
          },
        ],
      });
    });

    const createdOrderIds = new Set<number>();
    const responseTasks: Promise<void>[] = [];
    const captureCreatedOrder = (response: Response) => {
      if (!isCheckoutResponse(response)) return;
      responseTasks.push(
        response.json()
          .then((body: ApiEnvelope<CheckoutResponse>) => {
            if (body.data?.orderId) createdOrderIds.add(body.data.orderId);
          })
          .catch(() => undefined),
      );
    };
    page.on("response", captureCreatedOrder);

    await provide({ accessToken, api, variantId: variant!.id });

    page.off("response", captureCreatedOrder);
    await Promise.allSettled(responseTasks);
    for (const orderId of createdOrderIds) {
      const cancelResponse = await api.post(`${fullstackApiUrl}/checkout/${orderId}/cancel`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(cancelResponse.ok(), await cancelResponse.text()).toBeTruthy();
    }
  },
});

export { expect };
