import apiClient from "@/lib/api-client";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  unwrapApiResponse,
} from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";

export type SaleCampaignType = "STANDARD" | "FLASH";
export type SaleCampaignStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type SaleCampaignPhase = "UPCOMING" | "LIVE" | "ENDED";

export type AdminSalePagination = {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
};

export type AdminSalePage<T> = {
  meta: AdminSalePagination;
  result: T[];
};

export type AdminSaleCampaignItem = {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  image: string | null;
  sku: string;
  color: string | null;
  size: string | null;
  referencePrice: number;
  promotionalPrice: number;
  quota: number | null;
  reservedQuantity: number;
  soldQuantity: number;
  remainingQuota: number | null;
  maxPerCustomer: number | null;
};

export type AdminSaleCampaign = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  type: SaleCampaignType;
  status: SaleCampaignStatus;
  phase?: SaleCampaignPhase;
  startsAt: string;
  endsAt: string;
  version: number;
  itemCount?: number;
  totalQuota?: number | null;
  reservedQuantity?: number;
  soldQuantity?: number;
  items: AdminSaleCampaignItem[];
  createdAt: string;
  updatedAt: string;
};

export type AdminSaleCampaignListParams = {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  type?: SaleCampaignType;
  status?: SaleCampaignStatus;
  phase?: SaleCampaignPhase;
};

export type AdminSaleCampaignItemRequest = {
  variantId: number;
  promotionalPrice: number;
  quota: number | null;
  maxPerCustomer: number | null;
};

export type CreateAdminSaleCampaignRequest = {
  code: string;
  name: string;
  description: string | null;
  bannerUrl: string | null;
  type: SaleCampaignType;
  startsAt: string;
  endsAt: string;
  items: AdminSaleCampaignItemRequest[];
};

export type UpdateAdminSaleCampaignRequest =
  CreateAdminSaleCampaignRequest & {
    version: number;
  };

export type UpdateAdminSaleDisplayRequest = {
  name: string;
  description: string | null;
  bannerUrl: string | null;
  version: number;
};

export type SaleCampaignVersionRequest = {
  version: number;
};

export type IncreaseSaleQuotaRequest = SaleCampaignVersionRequest & {
  additionalQuantity: number;
};

export type EndAndCloneSaleCampaignRequest = SaleCampaignVersionRequest & {
  code: string;
  name: string;
  startsAt: string;
  endsAt: string;
};

async function apiPatch<T, TBody>(path: string, body: TBody): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(path, body);
  return unwrapApiResponse(response);
}

async function apiPostWithParams<T>(
  path: string,
  params: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(path, undefined, { params });
  return unwrapApiResponse(response);
}

export function getAdminSaleCampaigns(
  params: AdminSaleCampaignListParams = {},
) {
  return apiGet<AdminSalePage<AdminSaleCampaign>>("/sale-campaigns", {
    ...params,
  });
}

export function getAdminSaleCampaign(id: number) {
  return apiGet<AdminSaleCampaign>(`/sale-campaigns/${id}`);
}

export function createAdminSaleCampaign(
  request: CreateAdminSaleCampaignRequest,
) {
  return apiPost<AdminSaleCampaign, CreateAdminSaleCampaignRequest>(
    "/sale-campaigns",
    request,
  );
}

export function updateAdminSaleCampaign(
  id: number,
  request: UpdateAdminSaleCampaignRequest,
) {
  return apiPut<AdminSaleCampaign, UpdateAdminSaleCampaignRequest>(
    `/sale-campaigns/${id}`,
    request,
  );
}

export function deleteAdminSaleCampaign(id: number) {
  return apiDelete<void>(`/sale-campaigns/${id}`);
}

export function publishAdminSaleCampaign(
  id: number,
  version: number,
) {
  return apiPostWithParams<AdminSaleCampaign>(
    `/sale-campaigns/${id}/publish`,
    { version },
  );
}

export function cancelAdminSaleCampaign(
  id: number,
  version: number,
) {
  return apiPostWithParams<AdminSaleCampaign>(
    `/sale-campaigns/${id}/cancel`,
    { version },
  );
}

export function updateAdminSaleDisplay(
  id: number,
  request: UpdateAdminSaleDisplayRequest,
) {
  return apiPatch<AdminSaleCampaign, UpdateAdminSaleDisplayRequest>(
    `/sale-campaigns/${id}/display`,
    request,
  );
}

export function increaseAdminSaleQuota(
  campaignId: number,
  itemId: number,
  request: IncreaseSaleQuotaRequest,
) {
  return apiPost<AdminSaleCampaign, IncreaseSaleQuotaRequest>(
    `/sale-campaigns/${campaignId}/items/${itemId}/increase-quota`,
    request,
  );
}

export function endAdminSaleCampaign(
  id: number,
  version: number,
) {
  return apiPostWithParams<AdminSaleCampaign>(
    `/sale-campaigns/${id}/end`,
    { version },
  );
}

export function endAndCloneAdminSaleCampaign(
  id: number,
  request: EndAndCloneSaleCampaignRequest,
) {
  return apiPost<AdminSaleCampaign, EndAndCloneSaleCampaignRequest>(
    `/sale-campaigns/${id}/end-and-clone`,
    request,
  );
}
