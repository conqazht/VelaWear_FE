import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CheckoutPreviewResponse, CheckoutResponse } from "@/lib/checkout-api";

const {
  clearCartMock,
  getVietnamProvincesMock,
  getVietnamWardsMock,
  previewCheckoutMock,
  refreshCartMock,
  submitCheckoutMock,
  useAuthMock,
  useCartMock,
  useI18nMock,
  useMyAddressesQueryMock,
} = vi.hoisted(() => ({
  clearCartMock: vi.fn(),
  getVietnamProvincesMock: vi.fn(),
  getVietnamWardsMock: vi.fn(),
  previewCheckoutMock: vi.fn(),
  refreshCartMock: vi.fn(),
  submitCheckoutMock: vi.fn(),
  useAuthMock: vi.fn(),
  useCartMock: vi.fn(),
  useI18nMock: vi.fn(),
  useMyAddressesQueryMock: vi.fn(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: useI18nMock,
}));

vi.mock("@/components/shop/cart-provider", () => ({
  useCart: useCartMock,
}));

vi.mock("@/components/shop/fashion-image", () => ({
  FashionImage: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

vi.mock("@/lib/queries/commerce", () => ({
  useMyAddressesQuery: useMyAddressesQueryMock,
}));

vi.mock("@/lib/vietnam-address-api", () => ({
  getVietnamProvinces: getVietnamProvincesMock,
  getVietnamWards: getVietnamWardsMock,
}));

vi.mock("@/lib/checkout-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/checkout-api")>();
  return {
    ...actual,
    previewCheckout: previewCheckoutMock,
    submitCheckout: submitCheckoutMock,
  };
});

import { CheckoutPageClient } from "@/components/shop/checkout-page-client";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

const preview: CheckoutPreviewResponse = {
  serverTime: "2026-07-15T00:00:00.000Z",
  pricingFingerprint: "fingerprint-1",
  subtotal: 249_000,
  couponEligibleSubtotal: 249_000,
  shippingFee: 30_000,
  discountAmount: 0,
  finalAmount: 279_000,
  items: [],
};

const completedOrder: CheckoutResponse = {
  orderId: 101,
  orderCode: "E2E-101",
  status: "PENDING",
  subtotal: 249_000,
  shippingFee: 30_000,
  discountAmount: 0,
  finalAmount: 279_000,
  receiverName: "Demo Customer",
  receiverPhone: "0900000000",
  receiverAddress: "123 Le Loi, Ben Nghe, Ho Chi Minh",
  paymentMethod: "COD",
  paymentStatus: "PENDING",
  items: [],
  paymentId: null,
  paymentInitiation: null,
  createdAt: "2026-07-15T00:00:00.000Z",
};

async function prepareCheckoutForm(container: HTMLElement) {
  await waitFor(() => expect(previewCheckoutMock).toHaveBeenCalledTimes(1));
  previewCheckoutMock.mockClear();

  const input = (name: string) => {
    const element = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    if (!element) throw new Error(`Missing checkout input ${name}`);
    return element;
  };

  fireEvent.change(input("phone"), { target: { value: "0900000000" } });
  fireEvent.change(input("address"), { target: { value: "123 Le Loi" } });

  await waitFor(() =>
    expect(container.querySelector('select[name="provinceCode"]')).not.toBeNull(),
  );
  const province = container.querySelector<HTMLSelectElement>('select[name="provinceCode"]')!;
  fireEvent.change(province, { target: { value: "79" } });

  await waitFor(() => expect(getVietnamWardsMock).toHaveBeenCalledWith(79, expect.anything()));
  await waitFor(() => expect(container.querySelector('select[name="wardCode"]')).not.toBeNull());
  const ward = container.querySelector<HTMLSelectElement>('select[name="wardCode"]')!;
  fireEvent.change(ward, { target: { value: "760" } });

  const form = container.querySelector("form");
  if (!form) throw new Error("Missing checkout form");
  return form;
}

describe("CheckoutPageClient rapid submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();

    useI18nMock.mockReturnValue({
      locale: "vi",
      t: (key: string) => key,
    });
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 7,
        email: "user@velawear.local",
        fullName: "Demo Customer",
      },
    });
    useCartMock.mockReturnValue({
      cart: [
        {
          id: "variant-11",
          variantId: 11,
          name: "Essential Cotton Tee",
          price: 249_000,
          image: "/tee.jpg",
          color: "Black",
          size: "M",
          quantity: 1,
        },
      ],
      clearCart: clearCartMock,
      refreshCart: refreshCartMock,
    });
    useMyAddressesQueryMock.mockReturnValue({
      data: { result: [] },
      isLoading: false,
      isError: false,
    });
    getVietnamProvincesMock.mockResolvedValue([
      {
        code: 79,
        name: "Ho Chi Minh",
        division_type: "city",
        codename: "ho_chi_minh",
      },
    ]);
    getVietnamWardsMock.mockResolvedValue([
      {
        code: 760,
        name: "Ben Nghe",
        division_type: "ward",
        codename: "ben_nghe",
        province_code: 79,
      },
    ]);
    previewCheckoutMock.mockResolvedValue(preview);
  });

  it("tự động hiển thị thẻ tóm tắt và điền thông tin từ địa chỉ mặc định của người dùng", async () => {
    useMyAddressesQueryMock.mockReturnValue({
      data: {
        result: [
          {
            id: 1,
            userId: 7,
            receiverName: "Nguyen Van A",
            phone: "0987654321",
            province: "Ho Chi Minh",
            ward: "Ben Nghe",
            addressDetail: "456 Dong Khoi",
            isDefault: true,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<CheckoutPageClient />);

    await waitFor(() => {
      expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
      expect(screen.getByText("0987654321")).toBeInTheDocument();
      expect(screen.getByText("456 Dong Khoi")).toBeInTheDocument();
      expect(screen.getByText("Ben Nghe, Ho Chi Minh")).toBeInTheDocument();
    });
  });

  it("gộp hai submit cùng tick thành đúng một checkout operation", async () => {
    const submitRequest = deferred<CheckoutResponse>();
    submitCheckoutMock.mockReturnValue(submitRequest.promise);

    const { container } = render(<CheckoutPageClient />);
    const form = await prepareCheckoutForm(container);
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(previewCheckoutMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(submitCheckoutMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      submitRequest.resolve(completedOrder);
      await submitRequest.promise;
    });

    expect(await screen.findByText("checkout.successTitle")).toBeInTheDocument();
    expect(clearCartMock).toHaveBeenCalledTimes(1);
  });

  it("mở gate sau lỗi và retry bằng cùng idempotency key", async () => {
    submitCheckoutMock
      .mockRejectedValueOnce(new Error("network interrupted"))
      .mockResolvedValueOnce(completedOrder);

    const { container } = render(<CheckoutPageClient />);
    const form = await prepareCheckoutForm(container);

    fireEvent.submit(form);
    await waitFor(() => expect(submitCheckoutMock).toHaveBeenCalledTimes(1));
    await screen.findByText("checkout.error.unknown");

    fireEvent.submit(form);
    await waitFor(() => expect(submitCheckoutMock).toHaveBeenCalledTimes(2));

    expect(submitCheckoutMock.mock.calls[1]?.[1]).toBe(submitCheckoutMock.mock.calls[0]?.[1]);
    expect(await screen.findByText("checkout.successTitle")).toBeInTheDocument();
  });
});
