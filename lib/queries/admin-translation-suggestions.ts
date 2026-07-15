"use client";

import { useMutation } from "@tanstack/react-query";

import {
  generateCategoryEnglishSuggestion,
  generateProductEnglishSuggestion,
  generateSaleCampaignEnglishSuggestion,
  type CategoryEnglishSuggestionRequest,
  type ProductEnglishSuggestionRequest,
  type SaleCampaignEnglishSuggestionRequest,
} from "@/lib/api/admin-translation-suggestions";

export function useProductEnglishSuggestionMutation() {
  return useMutation({
    mutationFn: (request: ProductEnglishSuggestionRequest) =>
      generateProductEnglishSuggestion(request),
  });
}

export function useCategoryEnglishSuggestionMutation() {
  return useMutation({
    mutationFn: (request: CategoryEnglishSuggestionRequest) =>
      generateCategoryEnglishSuggestion(request),
  });
}

export function useSaleCampaignEnglishSuggestionMutation() {
  return useMutation({
    mutationFn: (request: SaleCampaignEnglishSuggestionRequest) =>
      generateSaleCampaignEnglishSuggestion(request),
  });
}
