import { apiPost } from "@/lib/api/client";

export const GEMINI_CONTENT_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
] as const;

export type GeminiContentModel = (typeof GEMINI_CONTENT_MODELS)[number];

export const DEFAULT_GEMINI_CONTENT_MODEL: GeminiContentModel =
  "gemini-3.1-flash-lite";

export function isGeminiContentModel(value: string): value is GeminiContentModel {
  return GEMINI_CONTENT_MODELS.some((model) => model === value);
}

type SuggestionRequestBase = {
  model?: GeminiContentModel;
};

type EnglishSuggestionBase = {
  localeCode: "en";
  name: string;
};

export type ProductEnglishSuggestionRequest = SuggestionRequestBase & {
  name: string;
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  careInstruction: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type ProductEnglishSuggestion = EnglishSuggestionBase & {
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  careInstruction: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CategoryEnglishSuggestionRequest = SuggestionRequestBase & {
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CategoryEnglishSuggestion = EnglishSuggestionBase & {
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type SaleCampaignEnglishSuggestionRequest = SuggestionRequestBase & {
  name: string;
  description: string | null;
};

export type SaleCampaignEnglishSuggestion = EnglishSuggestionBase & {
  description: string | null;
};

export function generateProductEnglishSuggestion(
  request: ProductEnglishSuggestionRequest,
) {
  return apiPost<ProductEnglishSuggestion, ProductEnglishSuggestionRequest>(
    "/products/translation-suggestions/en",
    request,
  );
}

export function generateCategoryEnglishSuggestion(
  request: CategoryEnglishSuggestionRequest,
) {
  return apiPost<CategoryEnglishSuggestion, CategoryEnglishSuggestionRequest>(
    "/categories/translation-suggestions/en",
    request,
  );
}

export function generateSaleCampaignEnglishSuggestion(
  request: SaleCampaignEnglishSuggestionRequest,
) {
  return apiPost<
    SaleCampaignEnglishSuggestion,
    SaleCampaignEnglishSuggestionRequest
  >("/sale-campaigns/translation-suggestions/en", request);
}
