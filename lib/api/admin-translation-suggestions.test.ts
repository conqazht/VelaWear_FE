import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiPostMock } = vi.hoisted(() => ({ apiPostMock: vi.fn() }));

vi.mock("@/lib/api/client", () => ({ apiPost: apiPostMock }));

import {
  generateCategoryEnglishSuggestion,
  generateProductEnglishSuggestion,
  generateSaleCampaignEnglishSuggestion,
} from "@/lib/api/admin-translation-suggestions";

describe("admin English translation suggestion API", () => {
  beforeEach(() => {
    apiPostMock.mockReset().mockResolvedValue({ localeCode: "en", name: "English" });
  });

  it("sends Product VI content and the curated Gemini model without a slug", async () => {
    const request = {
      model: "gemini-3.1-flash-lite" as const,
      name: "Áo blazer linen",
      shortDescription: "Dáng may đo",
      description: null,
      material: "Vải linen",
      careInstruction: null,
      seoTitle: null,
      seoDescription: null,
    };

    await generateProductEnglishSuggestion(request);

    expect(apiPostMock).toHaveBeenCalledWith("/products/translation-suggestions/en", request);
    expect(request).not.toHaveProperty("slug");
  });

  it("uses the Category suggestion endpoint", async () => {
    const request = {
      model: "gemini-3.5-flash" as const,
      name: "Đồ may đo",
      description: "Thiết kế hiện đại",
      seoTitle: null,
      seoDescription: null,
    };

    await generateCategoryEnglishSuggestion(request);

    expect(apiPostMock).toHaveBeenCalledWith("/categories/translation-suggestions/en", request);
  });

  it("uses the Sale Campaign suggestion endpoint", async () => {
    const request = {
      model: "gemini-3.1-pro-preview" as const,
      name: "Ưu đãi mùa hè",
      description: "Giảm giá trong tuần này",
    };

    await generateSaleCampaignEnglishSuggestion(request);

    expect(apiPostMock).toHaveBeenCalledWith("/sale-campaigns/translation-suggestions/en", request);
  });
});
