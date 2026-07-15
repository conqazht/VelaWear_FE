import { describe, expect, it } from "vitest";

import { extractCheckoutError } from "@/lib/checkout-api";

function apiError(status: number, code: string, message = "") {
  return { response: { status, data: { statusCode: status, code, message, data: null } } };
}

describe("extractCheckoutError", () => {
  it.each([
    ["INSUFFICIENT_STOCK", "insufficient_stock"],
    ["FLASH_SALE_SOLD_OUT", "flash_sold_out"],
    ["FLASH_SALE_ENDED", "flash_ended"],
    ["FLASH_SALE_LIMIT_EXCEEDED", "customer_limit"],
    ["PRICE_CHANGED", "price_changed"],
    ["IDEMPOTENCY_KEY_REUSED", "idempotency_conflict"],
  ] as const)("map stable code %s thành %s", (code, expectedKind) => {
    expect(extractCheckoutError(apiError(409, code))).toMatchObject({
      kind: expectedKind,
      code,
      status: 409,
    });
  });

  it("giữ nguyên message nghiệp vụ từ server", () => {
    expect(
      extractCheckoutError(apiError(409, "FLASH_SALE_SOLD_OUT", "Size M vừa hết suất")),
    ).toMatchObject({ message: "Size M vừa hết suất" });
  });
});
