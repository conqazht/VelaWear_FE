import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createMyAddressMock,
  deleteMyAddressMock,
  getMyAddressesMock,
  getMyOrdersMock,
  updateMyAddressMock,
  updateMyProfileMock,
} = vi.hoisted(() => ({
  createMyAddressMock: vi.fn(),
  deleteMyAddressMock: vi.fn(),
  getMyAddressesMock: vi.fn(),
  getMyOrdersMock: vi.fn(),
  updateMyAddressMock: vi.fn(),
  updateMyProfileMock: vi.fn(),
}));

vi.mock("@/lib/api/commerce", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/commerce")>();
  return {
    ...actual,
    createMyAddress: createMyAddressMock,
    deleteMyAddress: deleteMyAddressMock,
    getMyAddresses: getMyAddressesMock,
    getMyOrders: getMyOrdersMock,
    updateMyAddress: updateMyAddressMock,
    updateMyProfile: updateMyProfileMock,
  };
});

import {
  useCreateMyAddressMutation,
  useDeleteMyAddressMutation,
  useMyAddressesQuery,
  useMyOrdersQuery,
  useUpdateMyAddressMutation,
  useUpdateProfileMutation,
} from "@/lib/queries/commerce";
import { queryKeys } from "@/lib/queries/keys";

function createQueryHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { queryClient, Wrapper };
}

describe("customer self-service query hooks", () => {
  beforeEach(() => {
    createMyAddressMock.mockReset().mockResolvedValue({ id: 7 });
    deleteMyAddressMock.mockReset().mockResolvedValue(undefined);
    getMyAddressesMock.mockReset().mockResolvedValue({
      meta: { page: 1, pageSize: 10, pages: 1, total: 0 },
      result: [],
    });
    getMyOrdersMock.mockReset().mockResolvedValue({
      meta: { page: 1, pageSize: 10, pages: 1, total: 0 },
      result: [],
    });
    updateMyAddressMock.mockReset().mockResolvedValue({ id: 7 });
    updateMyProfileMock.mockReset().mockResolvedValue({ id: 11 });
  });

  it("keeps guest order and address queries disabled", () => {
    const { Wrapper } = createQueryHarness();
    const orders = renderHook(
      () => useMyOrdersQuery(undefined, { page: 1, size: 10 }),
      { wrapper: Wrapper },
    );
    const addresses = renderHook(
      () => useMyAddressesQuery(undefined, { page: 1, size: 10 }),
      { wrapper: Wrapper },
    );

    expect(orders.result.current.fetchStatus).toBe("idle");
    expect(addresses.result.current.fetchStatus).toBe("idle");
    expect(getMyOrdersMock).not.toHaveBeenCalled();
    expect(getMyAddressesMock).not.toHaveBeenCalled();
  });

  it("uses account identity only in keys and never forwards it to self requests", async () => {
    const { queryClient, Wrapper } = createQueryHarness();
    const orderParams = { page: 2, size: 20, sort: "createdAt,desc" };
    const addressParams = { page: 1, size: 100 };

    renderHook(() => useMyOrdersQuery(11, orderParams), { wrapper: Wrapper });
    renderHook(() => useMyAddressesQuery(11, addressParams), { wrapper: Wrapper });

    await waitFor(() => {
      expect(getMyOrdersMock).toHaveBeenCalledWith(orderParams);
      expect(getMyAddressesMock).toHaveBeenCalledWith(addressParams);
    });
    expect(getMyOrdersMock).not.toHaveBeenCalledWith(11, orderParams);
    expect(getMyAddressesMock).not.toHaveBeenCalledWith(11, addressParams);
    expect(queryClient.getQueryState(queryKeys.orders.meList(11, orderParams))).toBeDefined();
    expect(queryClient.getQueryState(queryKeys.addresses.meList(11, addressParams))).toBeDefined();
  });

  it("refetches under a distinct key when the authenticated account changes", async () => {
    getMyOrdersMock
      .mockResolvedValueOnce({
        meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
        result: [{ id: 101 }],
      })
      .mockResolvedValueOnce({
        meta: { page: 1, pageSize: 10, pages: 1, total: 1 },
        result: [{ id: 202 }],
      });
    const { queryClient, Wrapper } = createQueryHarness();
    const params = { page: 1, size: 10 };
    const { rerender } = renderHook(
      ({ accountId }) => useMyOrdersQuery(accountId, params),
      { initialProps: { accountId: 11 }, wrapper: Wrapper },
    );

    await waitFor(() => expect(getMyOrdersMock).toHaveBeenCalledTimes(1));
    rerender({ accountId: 22 });
    await waitFor(() => expect(getMyOrdersMock).toHaveBeenCalledTimes(2));

    expect(queryKeys.orders.meList(11, params)).not.toEqual(
      queryKeys.orders.meList(22, params),
    );
    expect(queryClient.getQueryData<{ result: Array<{ id: number }> }>(
      queryKeys.orders.meList(11, params),
    )?.result[0]?.id).toBe(101);
    expect(queryClient.getQueryData<{ result: Array<{ id: number }> }>(
      queryKeys.orders.meList(22, params),
    )?.result[0]?.id).toBe(202);
  });

  it("uses self address mutations and preserves root invalidation", async () => {
    const { queryClient, Wrapper } = createQueryHarness();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const request = {
      receiverName: "Customer A",
      phone: "0900000000",
      province: "Ho Chi Minh",
      ward: "Ben Nghe",
      addressDetail: "1 Self-service Street",
      isDefault: true,
    };
    const createHook = renderHook(() => useCreateMyAddressMutation(), {
      wrapper: Wrapper,
    });
    const updateHook = renderHook(() => useUpdateMyAddressMutation(), {
      wrapper: Wrapper,
    });
    const deleteHook = renderHook(() => useDeleteMyAddressMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await createHook.result.current.mutateAsync(request);
      await updateHook.result.current.mutateAsync({ id: 7, request });
      await deleteHook.result.current.mutateAsync(7);
    });

    expect(createMyAddressMock).toHaveBeenCalledWith(request);
    expect(updateMyAddressMock).toHaveBeenCalledWith(7, request);
    expect(deleteMyAddressMock).toHaveBeenCalledWith(7);
    expect(invalidateSpy).toHaveBeenCalledTimes(3);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.addresses.root });
  });

  it("updates only the dedicated profile DTO and invalidates auth state", async () => {
    const { queryClient, Wrapper } = createQueryHarness();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateProfileMutation(), {
      wrapper: Wrapper,
    });
    const request = {
      fullName: "Customer A",
      birthDate: "1995-05-20",
      gender: "FEMALE" as const,
    };

    await act(async () => {
      await result.current.mutateAsync(request);
    });

    expect(updateMyProfileMock).toHaveBeenCalledWith(request);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.auth.root });
  });
});
