import type { APIRequestContext, APIResponse } from "@playwright/test";

import { expect, fullstackApiUrl, test } from "../fixtures/fullstack";

type ApiEnvelope<T> = {
  data: T;
};

type PaginatedResult<T> = {
  result: T[];
};

type OwnedOrder = {
  id: number;
  orderCode: string;
};

type OwnedAddress = {
  id: number;
};

type AuthenticatedApiAccount = {
  accessToken: string;
  api: APIRequestContext;
};

function authorizationHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function getAsAccount(account: AuthenticatedApiAccount, path: string) {
  return account.api.get(`${fullstackApiUrl}${path}`, {
    headers: authorizationHeaders(account.accessToken),
  });
}

function expectStatus(response: APIResponse, status: number, operation: string) {
  expect(
    response.status(),
    `${operation} returned HTTP ${response.status()} instead of ${status}`,
  ).toBe(status);
}

async function getSuccessfulJson<T>(
  account: AuthenticatedApiAccount,
  path: string,
  operation: string,
) {
  const response = await getAsAccount(account, path);
  expectStatus(response, 200, operation);
  return response.json() as Promise<T>;
}

test(
  "two accounts cannot cross self-service ownership",
  { tag: "@fullstack" },
  async ({ ownershipAccounts }) => {
    const primaryResources =
      await test.step("primary account discovers its own resources", async () => {
        const [ordersBody, addressesBody] = await Promise.all([
          getSuccessfulJson<ApiEnvelope<PaginatedResult<OwnedOrder>>>(
            ownershipAccounts.primary,
            "/orders/me?size=100",
            "Primary order list",
          ),
          getSuccessfulJson<ApiEnvelope<PaginatedResult<OwnedAddress>>>(
            ownershipAccounts.primary,
            "/user-addresses/me?size=100",
            "Primary address list",
          ),
        ]);

        const order = ordersBody.data.result[0];
        const address = addressesBody.data.result[0];
        if (!order) {
          throw new Error(
            "Seed prerequisite missing: the primary E2E account must own at least one order",
          );
        }
        if (!address) {
          throw new Error(
            "Seed prerequisite missing: the primary E2E account must own at least one address",
          );
        }
        if (!Number.isInteger(order.id) || !order.orderCode) {
          throw new Error(
            "Seed prerequisite invalid: the primary order must expose an ID and order code",
          );
        }
        if (!Number.isInteger(address.id)) {
          throw new Error("Seed prerequisite invalid: the primary address must expose an ID");
        }

        return { addressId: address.id, orderCode: order.orderCode, orderId: order.id };
      });

    const encodedOrderCode = encodeURIComponent(primaryResources.orderCode);
    const ownershipPaths = [
      {
        label: "order by ID",
        path: `/orders/me/${primaryResources.orderId}`,
      },
      {
        label: "order by code",
        path: `/orders/me/code/${encodedOrderCode}`,
      },
      {
        label: "order status histories",
        path: `/orders/me/${primaryResources.orderId}/status-histories?size=100`,
      },
      {
        label: "address by ID",
        path: `/user-addresses/me/${primaryResources.addressId}`,
      },
    ] as const;

    await test.step("both configured accounts can read their own self-service lists", async () => {
      const secondaryOwnResponses = await Promise.all([
        getAsAccount(ownershipAccounts.secondary, "/orders/me?size=100"),
        getAsAccount(ownershipAccounts.secondary, "/user-addresses/me?size=100"),
      ]);

      expectStatus(secondaryOwnResponses[0], 200, "Secondary order list");
      expectStatus(secondaryOwnResponses[1], 200, "Secondary address list");

      const secondaryOrdersBody = (await secondaryOwnResponses[0].json()) as ApiEnvelope<
        PaginatedResult<OwnedOrder>
      >;
      const secondaryAddressesBody = (await secondaryOwnResponses[1].json()) as ApiEnvelope<
        PaginatedResult<OwnedAddress>
      >;
      expect(
        secondaryOrdersBody.data.result.map((order) => order.id),
        "Secondary order list exposed the primary order ID",
      ).not.toContain(primaryResources.orderId);
      expect(
        secondaryOrdersBody.data.result.map((order) => order.orderCode),
        "Secondary order list exposed the primary order code",
      ).not.toContain(primaryResources.orderCode);
      expect(
        secondaryAddressesBody.data.result.map((address) => address.id),
        "Secondary address list exposed the primary address ID",
      ).not.toContain(primaryResources.addressId);

      const primaryOwnResponses = await Promise.all(
        ownershipPaths.map(({ path }) => getAsAccount(ownershipAccounts.primary, path)),
      );
      primaryOwnResponses.forEach((response, index) => {
        expectStatus(response, 200, `Primary ${ownershipPaths[index].label}`);
      });
    });

    await test.step("secondary account cannot read primary resources", async () => {
      const foreignResponses = await Promise.all(
        ownershipPaths.map(({ path }) => getAsAccount(ownershipAccounts.secondary, path)),
      );
      foreignResponses.forEach((response, index) => {
        expectStatus(response, 404, `Foreign ${ownershipPaths[index].label}`);
      });
    });
  },
);
