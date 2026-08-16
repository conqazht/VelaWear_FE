import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deriveSalePhase,
  getCountdown,
  getServerClockOffset,
  groupSaleItems,
} from "@/lib/sale-utils";

describe("sale-utils", () => {
  afterEach(() => vi.restoreAllMocks());

  const startsAt = "2026-07-15T01:00:00.000Z";
  const endsAt = "2026-07-15T02:00:00.000Z";

  it("tính phase từ status và thời gian thay vì lưu phase dễ bị cũ", () => {
    expect(deriveSalePhase("PUBLISHED", startsAt, endsAt, Date.parse("2026-07-15T00:00:00Z"))).toBe(
      "UPCOMING",
    );
    expect(deriveSalePhase("PUBLISHED", startsAt, endsAt, Date.parse("2026-07-15T01:30:00Z"))).toBe(
      "LIVE",
    );
    expect(deriveSalePhase("PUBLISHED", startsAt, endsAt, Date.parse("2026-07-15T03:00:00Z"))).toBe(
      "ENDED",
    );
    expect(deriveSalePhase("CANCELLED", startsAt, endsAt, Date.parse("2026-07-15T00:00:00Z"))).toBe(
      "ENDED",
    );
  });

  it("không trả countdown âm", () => {
    expect(getCountdown("2026-07-15T01:01:01Z", Date.parse("2026-07-15T00:00:00Z"))).toMatchObject({
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
    expect(
      getCountdown("2026-07-14T00:00:00Z", Date.parse("2026-07-15T00:00:00Z")).totalSeconds,
    ).toBe(0);
  });

  it("dùng serverTime để bù lệch đồng hồ thiết bị", () => {
    vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-07-15T00:00:00Z"));
    expect(getServerClockOffset("2026-07-15T00:00:05Z")).toBe(5_000);
  });

  it("gộp nhiều variant thành một card sản phẩm và cộng quota", () => {
    const groups = groupSaleItems([
      {
        id: 1,
        campaignId: 10,
        variantId: 101,
        productId: 7,
        productName: "Áo linen",
        productSlug: "ao-linen",
        sku: "AO-S",
        referencePrice: 500_000,
        promotionalPrice: 400_000,
        stockQuantity: 1,
        availableQuantity: 1,
        quota: 5,
        reservedQuantity: 0,
        soldQuantity: 1,
        remainingQuota: 4,
        maxPerCustomer: 2,
      },
      {
        id: 2,
        campaignId: 10,
        variantId: 102,
        productId: 7,
        productName: "Áo linen",
        productSlug: "ao-linen",
        sku: "AO-M",
        referencePrice: 500_000,
        promotionalPrice: 390_000,
        stockQuantity: 2,
        availableQuantity: 2,
        quota: 3,
        reservedQuantity: 1,
        soldQuantity: 0,
        remainingQuota: 2,
        maxPerCustomer: 1,
      },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      promotionalPrice: 390_000,
      quota: 8,
      remainingQuota: 6,
      availableQuantity: 3,
      maxPerCustomer: 1,
    });
  });
});
