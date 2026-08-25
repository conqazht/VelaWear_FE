import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteMock, getMock, postMock, putMock } = vi.hoisted(() => ({
  deleteMock: vi.fn(),
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  default: {
    delete: deleteMock,
    get: getMock,
    post: postMock,
    put: putMock,
  },
}));

import {
  createMyAddress,
  createMyWishlist,
  deleteMyAddress,
  deleteMyWishlist,
  getMyAddressById,
  getMyAddresses,
  getMyCart,
  getMyOrderByCode,
  getMyOrderById,
  getMyOrders,
  getMyOrderStatusHistories,
  getMyReviews,
  getMyWishlists,
  replaceMyCartItems,
  updateMyAddress,
  updateMyProfile,
  uploadMyAvatar,
  type CreateMyAddressRequest,
  type UpdateMyAddressRequest,
  type UpdateMyProfileRequest,
} from "@/lib/api/commerce";

const envelope = (data: unknown = {}) => ({ data: { data } });

describe("customer self-service API contract", () => {
  beforeEach(() => {
    deleteMock.mockReset().mockResolvedValue(envelope());
    getMock.mockReset().mockResolvedValue(envelope());
    postMock.mockReset().mockResolvedValue(envelope());
    putMock.mockReset().mockResolvedValue(envelope());
  });

  it("uses only the ownership-bound order routes", async () => {
    await getMyOrders({ page: 2, size: 20, sort: "createdAt,desc" });
    await getMyOrderByCode("ORDER/A 1");
    await getMyOrderById(41);
    await getMyOrderStatusHistories(41, { size: 100, sort: "createdAt,asc" });

    expect(getMock).toHaveBeenNthCalledWith(1, "/orders/me", {
      params: { page: 2, size: 20, sort: "createdAt,desc" },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, "/orders/me/code/ORDER%2FA%201", {
      params: undefined,
    });
    expect(getMock).toHaveBeenNthCalledWith(3, "/orders/me/41", {
      params: undefined,
    });
    expect(getMock).toHaveBeenNthCalledWith(4, "/orders/me/41/status-histories", {
      params: { size: 100, sort: "createdAt,asc" },
    });
  });

  it("uses self address CRUD and strips a forged userId from mutation bodies", async () => {
    const unsafeAddress = {
      receiverName: "Customer A",
      phone: "0900000000",
      province: "Ho Chi Minh",
      ward: "Ben Nghe",
      addressDetail: "1 Self-service Street",
      isDefault: true,
      userId: 999,
    } as CreateMyAddressRequest & UpdateMyAddressRequest & { userId: number };

    await getMyAddresses({ page: 1, size: 10 });
    await getMyAddressById(9);
    await createMyAddress(unsafeAddress);
    await updateMyAddress(9, unsafeAddress);
    await deleteMyAddress(9);

    const expectedBody = {
      receiverName: "Customer A",
      phone: "0900000000",
      province: "Ho Chi Minh",
      ward: "Ben Nghe",
      addressDetail: "1 Self-service Street",
      isDefault: true,
    };
    expect(getMock).toHaveBeenNthCalledWith(1, "/user-addresses/me", {
      params: { page: 1, size: 10 },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, "/user-addresses/me/9", {
      params: undefined,
    });
    expect(postMock).toHaveBeenCalledWith("/user-addresses/me", expectedBody);
    expect(putMock).toHaveBeenCalledWith("/user-addresses/me/9", expectedBody);
    expect(deleteMock).toHaveBeenCalledWith("/user-addresses/me/9");
    expect(postMock.mock.calls[0]?.[1]).not.toHaveProperty("userId");
    expect(putMock.mock.calls[0]?.[1]).not.toHaveProperty("userId");
  });

  it("serializes only the dedicated profile fields and cannot forward avatar", async () => {
    const unsafeRequest = {
      fullName: "Customer A",
      birthDate: "1995-05-20",
      gender: "FEMALE",
      avatar: "https://attacker.invalid/avatar.webp",
      id: 999,
    } as UpdateMyProfileRequest & { avatar: string; id: number };

    await updateMyProfile(unsafeRequest);

    expect(putMock).toHaveBeenCalledWith("/users/me", {
      fullName: "Customer A",
      birthDate: "1995-05-20",
      gender: "FEMALE",
    });
    expect(putMock.mock.calls[0]?.[1]).not.toHaveProperty("avatar");
    expect(putMock.mock.calls[0]?.[1]).not.toHaveProperty("id");
  });

  it("uploads user avatar via PUT /files/avatar with FormData", async () => {
    const file = new File(["test-image-content"], "avatar.png", { type: "image/png" });
    await uploadMyAvatar(file);

    expect(putMock).toHaveBeenCalledTimes(1);
    expect(putMock.mock.calls[0]?.[0]).toBe("/files/avatar");
    const sentFormData = putMock.mock.calls[0]?.[1] as FormData;
    expect(sentFormData).toBeInstanceOf(FormData);
    expect(sentFormData.get("file")).toBe(file);
  });

  it("preserves the existing cart, wishlist and review self routes", async () => {
    await getMyCart();
    await replaceMyCartItems({ items: [{ variantId: 7, quantity: 2 }] });
    await getMyWishlists({ page: 1, size: 12 });
    await createMyWishlist(7);
    await deleteMyWishlist(7);
    await getMyReviews({ page: 1, size: 5, orderId: 41 });

    expect(getMock).toHaveBeenNthCalledWith(1, "/carts/me", { params: undefined });
    expect(putMock).toHaveBeenCalledWith("/carts/me/items", {
      items: [{ variantId: 7, quantity: 2 }],
    });
    expect(getMock).toHaveBeenNthCalledWith(2, "/wishlists/me", {
      params: { page: 1, size: 12 },
    });
    expect(postMock).toHaveBeenCalledWith("/wishlists/me/7", undefined);
    expect(deleteMock).toHaveBeenCalledWith("/wishlists/me/7");
    expect(getMock).toHaveBeenNthCalledWith(3, "/reviews/me", {
      params: { page: 1, size: 5, orderId: 41 },
    });
  });

  it("propagates cross-account 404 responses without inspecting message text", async () => {
    const denied = { response: { status: 404, data: { message: "opaque" } } };

    getMock.mockRejectedValueOnce(denied);
    await expect(getMyOrderByCode("FOREIGN")).rejects.toBe(denied);
    getMock.mockRejectedValueOnce(denied);
    await expect(getMyOrderById(404)).rejects.toBe(denied);
    getMock.mockRejectedValueOnce(denied);
    await expect(getMyOrderStatusHistories(404)).rejects.toBe(denied);
    getMock.mockRejectedValueOnce(denied);
    await expect(getMyAddressById(404)).rejects.toBe(denied);
  });
});
