import {
  expect,
  test as base,
  type APIRequestContext,
  type Response,
} from "@playwright/test";

export const fullstackApiUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:8080/api/v1";
export const fullstackUserEmail = process.env.E2E_USER_EMAIL ?? "user@velawear.local";
export const fullstackUserPassword = process.env.E2E_USER_PASSWORD ?? "Password123!";
const fullstackSecondUserEmail = process.env.E2E_SECOND_USER_EMAIL ?? "linh@velawear.local";
const fullstackSecondUserPassword = process.env.E2E_SECOND_USER_PASSWORD ?? "Password123!";
const variantSku = process.env.E2E_VARIANT_SKU ?? "VW-TEE-BLK-M";

type ApiEnvelope<T> = {
  data: T;
};

type LoginResponse = {
  accessToken: string;
};

type FullstackCredentials = {
  email: string;
  password: string;
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

type AuthenticatedApiAccount = {
  accessToken: string;
  api: APIRequestContext;
};

type OwnershipAccounts = {
  primary: AuthenticatedApiAccount;
  secondary: AuthenticatedApiAccount;
};

type FullstackFixtures = {
  authenticatedSession: AuthenticatedSession;
  fullstackSession: FullstackSession;
  ownershipAccounts: OwnershipAccounts;
};

function isCheckoutResponse(response: Response) {
  const url = new URL(response.url());
  return response.request().method() === "POST" &&
    url.pathname === "/api/v1/checkout" &&
    response.status() === 201;
}

async function loginFullstackAccount(
  api: APIRequestContext,
  credentials: FullstackCredentials,
  accountLabel: string,
) {
  const loginResponse = await api.post(`${fullstackApiUrl}/auth/login`, {
    data: credentials,
  });

  expect(
    loginResponse.ok(),
    `${accountLabel} E2E account login failed with HTTP ${loginResponse.status()}`,
  ).toBeTruthy();
  const loginBody = await loginResponse.json() as ApiEnvelope<LoginResponse>;
  if (!loginBody.data?.accessToken) {
    throw new Error(`${accountLabel} E2E account login returned no access token`);
  }
  return loginBody.data.accessToken;
}

export async function loginFullstackUser(api: APIRequestContext) {
  return loginFullstackAccount(
    api,
    { email: fullstackUserEmail, password: fullstackUserPassword },
    "Primary",
  );
}

export async function loginFullstackSecondUser(api: APIRequestContext) {
  return loginFullstackAccount(
    api,
    { email: fullstackSecondUserEmail, password: fullstackSecondUserPassword },
    "Secondary",
  );
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

  ownershipAccounts: async ({ playwright }, provide) => {
    if (fullstackUserEmail.trim().toLowerCase() === fullstackSecondUserEmail.trim().toLowerCase()) {
      throw new Error("E2E ownership smoke requires two different configured accounts");
    }

    const primaryApi = await playwright.request.newContext();
    let secondaryApi: APIRequestContext | undefined;
    let primaryAccessToken: string | undefined;
    let secondaryAccessToken: string | undefined;

    try {
      secondaryApi = await playwright.request.newContext();
      primaryAccessToken = await loginFullstackAccount(
        primaryApi,
        { email: fullstackUserEmail, password: fullstackUserPassword },
        "Primary",
      );
      secondaryAccessToken = await loginFullstackAccount(
        secondaryApi,
        { email: fullstackSecondUserEmail, password: fullstackSecondUserPassword },
        "Secondary",
      );

      await provide({
        primary: { accessToken: primaryAccessToken, api: primaryApi },
        secondary: { accessToken: secondaryAccessToken, api: secondaryApi },
      });
    } finally {
      await Promise.all([
        primaryAccessToken
          ? cleanupAuthenticatedSession(primaryApi, primaryAccessToken)
          : Promise.resolve(),
        secondaryApi && secondaryAccessToken
          ? cleanupAuthenticatedSession(secondaryApi, secondaryAccessToken)
          : Promise.resolve(),
      ]);
      await Promise.allSettled([
        primaryApi.dispose(),
        secondaryApi?.dispose() ?? Promise.resolve(),
      ]);
    }
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
