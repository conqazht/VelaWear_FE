import type { APIRequestContext, APIResponse } from "@playwright/test";

import { expect, fullstackApiUrl, test } from "../fixtures/fullstack";

type ApiEnvelope<T> = {
  data: T;
};

type PaginatedResult<T> = {
  result: T[];
};

type CategoryRecord = {
  id: number;
  name: string;
  slug: string;
  status: string;
  sortOrder?: number;
};

function authorizationHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

function expectStatus(response: APIResponse, status: number, operation: string) {
  expect(
    response.status(),
    `${operation} returned HTTP ${response.status()} instead of ${status}`,
  ).toBe(status);
}

test(
  "admin manages category lifecycle with deterministic ordering and status updates",
  { tag: "@fullstack" },
  async ({ adminSession, authenticatedSession, context }) => {
    const api: APIRequestContext = context.request;
    const adminToken = adminSession.accessToken;
    const userToken = authenticatedSession.accessToken;

    const testSlug = `e2e-test-cat-${Date.now()}`;
    let createdCategoryId: number | undefined;

    try {
      // 1. RBAC Guard: Verify normal user CANNOT access Admin Category creation
      await test.step("user without ADMIN role is blocked from creating category", async () => {
        const forbiddenResponse = await api.post(`${fullstackApiUrl}/categories`, {
          data: {
            name: "Forbidden Category",
            slug: `${testSlug}-forbidden`,
            status: "ACTIVE",
          },
          headers: authorizationHeaders(userToken),
        });

        expect(
          [401, 403].includes(forbiddenResponse.status()),
          `Expected 401 or 403 for non-admin, got ${forbiddenResponse.status()}`,
        ).toBeTruthy();
      });

      // 2. Admin creates category
      await test.step("admin successfully creates a new category", async () => {
        const createResponse = await api.post(`${fullstackApiUrl}/categories`, {
          data: {
            name: `E2E Category ${Date.now()}`,
            slug: testSlug,
            status: "ACTIVE",
            sortOrder: 99,
          },
          headers: authorizationHeaders(adminToken),
        });

        expectStatus(createResponse, 201, "Create category");
        const body = (await createResponse.json()) as ApiEnvelope<CategoryRecord>;
        expect(body.data.id).toBeTruthy();
        expect(body.data.slug).toBe(testSlug);
        expect(body.data.status).toBe("ACTIVE");

        createdCategoryId = body.data.id;
      });

      // 3. Admin fetches category list with deterministic id,desc ordering
      await test.step("admin lists categories with sort=id,desc", async () => {
        const listResponse = await api.get(`${fullstackApiUrl}/categories?sort=id,desc&size=50`, {
          headers: authorizationHeaders(adminToken),
        });

        expectStatus(listResponse, 200, "List categories");
        const listBody = (await listResponse.json()) as ApiEnvelope<
          PaginatedResult<CategoryRecord>
        >;
        const found = listBody.data.result.find((item) => item.id === createdCategoryId);
        expect(found, "Created category must exist in category list").toBeTruthy();
      });

      // 4. Admin updates status ACTIVE -> INACTIVE
      await test.step("admin toggles category status to INACTIVE", async () => {
        const patchResponse = await api.patch(
          `${fullstackApiUrl}/categories/${createdCategoryId}/status`,
          {
            data: { status: "INACTIVE" },
            headers: authorizationHeaders(adminToken),
          },
        );

        expectStatus(patchResponse, 200, "Patch status to INACTIVE");
        const patchBody = (await patchResponse.json()) as ApiEnvelope<CategoryRecord>;
        expect(patchBody.data.status).toBe("INACTIVE");
      });

      // 5. Admin updates status INACTIVE -> ACTIVE
      await test.step("admin toggles category status back to ACTIVE", async () => {
        const patchResponse = await api.patch(
          `${fullstackApiUrl}/categories/${createdCategoryId}/status`,
          {
            data: { status: "ACTIVE" },
            headers: authorizationHeaders(adminToken),
          },
        );

        expectStatus(patchResponse, 200, "Patch status to ACTIVE");
        const patchBody = (await patchResponse.json()) as ApiEnvelope<CategoryRecord>;
        expect(patchBody.data.status).toBe("ACTIVE");
      });
    } finally {
      // 6. Cleanup created category
      if (createdCategoryId) {
        await test.step("cleanup: delete temporary e2e category", async () => {
          const deleteResponse = await api.delete(
            `${fullstackApiUrl}/categories/${createdCategoryId}`,
            {
              headers: authorizationHeaders(adminToken),
            },
          );

          expect([200, 204, 404].includes(deleteResponse.status())).toBeTruthy();
        });
      }
    }
  },
);
