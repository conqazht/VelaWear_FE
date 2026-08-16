import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiDeleteMock, apiGetMock, apiPutMock, patchMock } = vi.hoisted(() => ({
  apiDeleteMock: vi.fn(),
  apiGetMock: vi.fn(),
  apiPutMock: vi.fn(),
  patchMock: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  default: { patch: patchMock },
}));

vi.mock("@/lib/api/client", () => ({
  apiDelete: apiDeleteMock,
  apiGet: apiGetMock,
  apiPost: vi.fn(),
  apiPut: apiPutMock,
  unwrapApiResponse: vi.fn(() => ({ id: 1 })),
}));

import {
  deleteAdminCategoryTranslation,
  deleteAdminProductTranslation,
  getAdminCategoryTranslations,
  getAdminProductTranslations,
  updateAdminBrandStatus,
  updateAdminCategoryTranslations,
  updateAdminProductStatus,
  updateAdminProductTranslations,
  updateAdminProductVariantStatus,
} from "@/lib/api/admin-commerce";
import {
  deleteAdminSaleCampaignTranslation,
  getAdminSaleCampaignTranslations,
  updateAdminSaleCampaignTranslations,
} from "@/lib/api/admin-sales";

describe("admin translation and status API contracts", () => {
  beforeEach(() => {
    apiDeleteMock.mockReset().mockResolvedValue(undefined);
    apiGetMock.mockReset();
    apiPutMock.mockReset();
    patchMock.mockReset().mockResolvedValue({ data: { result: { id: 1 } } });
  });

  it("reads the translation response wrappers used by each resource", async () => {
    apiGetMock
      .mockResolvedValueOnce({ translations: [] })
      .mockResolvedValueOnce({ translations: [] })
      .mockResolvedValueOnce({ version: 5, translations: [] });

    const product = await getAdminProductTranslations(12);
    const category = await getAdminCategoryTranslations(4);
    const sale = await getAdminSaleCampaignTranslations(9);

    expect(product.translations).toEqual([]);
    expect(category.translations).toEqual([]);
    expect(sale).toEqual({ version: 5, translations: [] });
    expect(apiGetMock).toHaveBeenNthCalledWith(1, "/products/12/translations");
    expect(apiGetMock).toHaveBeenNthCalledWith(2, "/categories/4/translations");
    expect(apiGetMock).toHaveBeenNthCalledWith(3, "/sale-campaigns/9/translations");
  });

  it("uses batch translation endpoints for Product and Category", async () => {
    apiPutMock.mockResolvedValue({ translations: [] });
    const productRequest = {
      translations: [
        {
          localeCode: "vi" as const,
          name: "Áo linen",
          slug: "ao-linen",
          shortDescription: null,
          description: null,
          material: null,
          careInstruction: null,
          seoTitle: null,
          seoDescription: null,
        },
      ],
    };
    const categoryRequest = {
      translations: [
        {
          localeCode: "en" as const,
          name: "Tailoring",
          slug: "tailoring",
          description: null,
          seoTitle: null,
          seoDescription: null,
        },
      ],
    };

    await updateAdminProductTranslations(12, productRequest);
    await updateAdminCategoryTranslations(4, categoryRequest);

    expect(apiPutMock).toHaveBeenNthCalledWith(1, "/products/12/translations", productRequest);
    expect(apiPutMock).toHaveBeenNthCalledWith(2, "/categories/4/translations", categoryRequest);
  });

  it("deletes Product/Category locale with a path segment", async () => {
    await deleteAdminProductTranslation(12, "en");
    await deleteAdminCategoryTranslation(4, "en");

    expect(apiDeleteMock).toHaveBeenNthCalledWith(1, "/products/12/translations/en");
    expect(apiDeleteMock).toHaveBeenNthCalledWith(2, "/categories/4/translations/en");
  });

  it("sends Sale version on batch update and locale delete", async () => {
    apiPutMock.mockResolvedValue({ version: 8, translations: [] });
    const request = {
      version: 7,
      translations: [{ localeCode: "vi" as const, name: "Sale hè", description: null }],
    };

    await updateAdminSaleCampaignTranslations(9, request);
    await deleteAdminSaleCampaignTranslation(9, "en", 8);

    expect(apiPutMock).toHaveBeenCalledWith("/sale-campaigns/9/translations", request);
    expect(apiDeleteMock).toHaveBeenCalledWith("/sale-campaigns/9/translations/en?version=8");
  });

  it("PATCHes the dedicated status endpoints", async () => {
    await updateAdminProductStatus(1, "ACTIVE");
    await updateAdminBrandStatus(2, "INACTIVE");
    await updateAdminProductVariantStatus(3, "ACTIVE");

    expect(patchMock).toHaveBeenNthCalledWith(1, "/products/1/status", {
      status: "ACTIVE",
    });
    expect(patchMock).toHaveBeenNthCalledWith(2, "/brands/2/status", {
      status: "INACTIVE",
    });
    expect(patchMock).toHaveBeenNthCalledWith(3, "/product-variants/3/status", {
      status: "ACTIVE",
    });
  });
});
