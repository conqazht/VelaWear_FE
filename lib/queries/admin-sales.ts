"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelAdminSaleCampaign,
  createAdminSaleCampaign,
  deleteAdminSaleCampaign,
  deleteAdminSaleCampaignTranslation,
  endAdminSaleCampaign,
  endAndCloneAdminSaleCampaign,
  getAdminSaleCampaign,
  getAdminSaleCampaigns,
  getAdminSaleCampaignTranslations,
  increaseAdminSaleQuota,
  publishAdminSaleCampaign,
  updateAdminSaleCampaign,
  updateAdminSaleCampaignTranslations,
  updateAdminSaleDisplay,
  type AdminSaleCampaignListParams,
  type CreateAdminSaleCampaignRequest,
  type EndAndCloneSaleCampaignRequest,
  type IncreaseSaleQuotaRequest,
  type SaleCampaignTranslationBatchRequest,
  type UpdateAdminSaleCampaignRequest,
  type UpdateAdminSaleDisplayRequest,
} from "@/lib/api/admin-sales";
import { invalidatePublicQueries } from "@/lib/queries/public-cache";

export const adminSalesQueryKeys = {
  root: ["admin-sales"] as const,
  lists: ["admin-sales", "list"] as const,
  list: (params: AdminSaleCampaignListParams) => ["admin-sales", "list", params] as const,
  details: ["admin-sales", "detail"] as const,
  detail: (id: number) => ["admin-sales", "detail", id] as const,
  translations: (id: number) => ["admin-sales", "detail", id, "translations"] as const,
};

export function useAdminSaleCampaignsQuery(params: AdminSaleCampaignListParams) {
  return useQuery({
    queryKey: adminSalesQueryKeys.list(params),
    queryFn: () => getAdminSaleCampaigns(params),
    placeholderData: (previousData, previousQuery) =>
      (previousQuery?.queryKey[2] as AdminSaleCampaignListParams | undefined)?.locale ===
      params.locale
        ? previousData
        : undefined,
  });
}

export function useAdminSaleCampaignQuery(id?: number) {
  return useQuery({
    queryKey: adminSalesQueryKeys.detail(id ?? 0),
    queryFn: () => getAdminSaleCampaign(id as number),
    enabled: typeof id === "number" && Number.isInteger(id) && id > 0,
  });
}

export function useAdminSaleCampaignTranslationsQuery(id?: number) {
  return useQuery({
    queryKey: adminSalesQueryKeys.translations(id ?? 0),
    queryFn: () => getAdminSaleCampaignTranslations(id as number),
    enabled: typeof id === "number" && Number.isInteger(id) && id > 0,
  });
}

function useInvalidateAdminSales() {
  const queryClient = useQueryClient();

  return async (campaignId?: number) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminSalesQueryKeys.lists }),
      invalidatePublicQueries(queryClient, ["sales", "productLists", "productDetails"]),
      campaignId
        ? queryClient.invalidateQueries({
            queryKey: adminSalesQueryKeys.detail(campaignId),
          })
        : Promise.resolve(),
    ]);
  };
}

export function useUpdateAdminSaleCampaignTranslationsMutation() {
  const invalidate = useInvalidateAdminSales();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: SaleCampaignTranslationBatchRequest }) =>
      updateAdminSaleCampaignTranslations(id, request),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        invalidate(variables.id),
        queryClient.invalidateQueries({
          queryKey: adminSalesQueryKeys.translations(variables.id),
        }),
      ]);
    },
  });
}

export function useDeleteAdminSaleCampaignTranslationMutation() {
  const invalidate = useInvalidateAdminSales();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, locale, version }: { id: number; locale: "en" | "vi"; version: number }) =>
      deleteAdminSaleCampaignTranslation(id, locale, version),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        invalidate(variables.id),
        queryClient.invalidateQueries({
          queryKey: adminSalesQueryKeys.translations(variables.id),
        }),
      ]);
    },
  });
}

export function useCreateAdminSaleCampaignMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: (request: CreateAdminSaleCampaignRequest) => createAdminSaleCampaign(request),
    onSuccess: async (campaign) => invalidate(campaign.id),
  });
}

export function useUpdateAdminSaleCampaignMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminSaleCampaignRequest }) =>
      updateAdminSaleCampaign(id, request),
    onSuccess: async (campaign) => invalidate(campaign.id),
  });
}

export function useDeleteAdminSaleCampaignMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: (id: number) => deleteAdminSaleCampaign(id),
    onSuccess: async () => invalidate(),
  });
}

export function usePublishAdminSaleCampaignMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: ({ id, version }: { id: number; version: number }) =>
      publishAdminSaleCampaign(id, version),
    onSuccess: async (campaign) => invalidate(campaign.id),
  });
}

export function useCancelAdminSaleCampaignMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: ({ id, version }: { id: number; version: number }) =>
      cancelAdminSaleCampaign(id, version),
    onSuccess: async (campaign) => invalidate(campaign.id),
  });
}

export function useUpdateAdminSaleDisplayMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateAdminSaleDisplayRequest }) =>
      updateAdminSaleDisplay(id, request),
    onSuccess: async (campaign) => invalidate(campaign.id),
  });
}

export function useIncreaseAdminSaleQuotaMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: ({
      campaignId,
      itemId,
      request,
    }: {
      campaignId: number;
      itemId: number;
      request: IncreaseSaleQuotaRequest;
    }) => increaseAdminSaleQuota(campaignId, itemId, request),
    onSuccess: async (campaign) => invalidate(campaign.id),
  });
}

export function useEndAdminSaleCampaignMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: ({ id, version }: { id: number; version: number }) =>
      endAdminSaleCampaign(id, version),
    onSuccess: async (campaign) => invalidate(campaign.id),
  });
}

export function useEndAndCloneAdminSaleCampaignMutation() {
  const invalidate = useInvalidateAdminSales();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: EndAndCloneSaleCampaignRequest }) =>
      endAndCloneAdminSaleCampaign(id, request),
    onSuccess: async (campaign) => invalidate(campaign.id),
  });
}
