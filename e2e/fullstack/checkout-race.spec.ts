import { expect, test } from "../fixtures/fullstack";

function isCheckoutRequest(url: string, method: string) {
  return method === "POST" && new URL(url).pathname === "/api/v1/checkout";
}

function isCheckoutPreviewRequest(url: string, method: string) {
  return method === "POST" && new URL(url).pathname === "/api/v1/checkout/preview";
}

test(
  "hai requestSubmit cùng tick chỉ tạo một checkout request",
  { tag: "@fullstack" },
  async ({ fullstackSession, page }) => {
    expect(fullstackSession.variantId).toBeGreaterThan(0);

    await page.goto("/checkout");

    const checkoutForm = page.locator('form:has(input[name="email"])');
    await expect(checkoutForm.locator('input[name="email"]')).toBeVisible();
    await checkoutForm.locator('input[name="email"]').fill("user@velawear.local");
    await checkoutForm.locator('input[name="phone"]').fill("0900000000");
    await checkoutForm.locator('input[name="firstName"]').fill("Demo");
    await checkoutForm.locator('input[name="lastName"]').fill("Customer");
    await checkoutForm.locator('input[name="address"]').fill("123 Le Loi");
    await checkoutForm.locator('select[name="provinceCode"]').selectOption("79");
    await checkoutForm.locator('select[name="wardCode"]').selectOption("760");

    const submitButton = checkoutForm.getByRole("button", {
      name: /Hoàn tất đặt hàng|Complete order/i,
    });
    await expect(submitButton).toBeEnabled();

    let checkoutPreviewRequestCount = 0;
    let checkoutRequestCount = 0;
    page.on("request", (request) => {
      if (isCheckoutPreviewRequest(request.url(), request.method())) {
        checkoutPreviewRequestCount += 1;
      }
      if (isCheckoutRequest(request.url(), request.method())) {
        checkoutRequestCount += 1;
      }
    });

    const checkoutResponse = page.waitForResponse((response) =>
      isCheckoutRequest(response.url(), response.request().method()),
    );

    await checkoutForm.evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
      form.requestSubmit();
    });

    const response = await checkoutResponse;
    const responseBody = await response.json() as ApiEnvelope<{ orderId: number }>;

    expect(response.status()).toBe(201);
    expect(responseBody.data.orderId).toBeGreaterThan(0);
    await expect(
      page.getByText(/Đặt hàng thành công|Order placed successfully/i),
    ).toBeVisible();
    expect(checkoutPreviewRequestCount).toBe(1);
    expect(checkoutRequestCount).toBe(1);
  },
);

type ApiEnvelope<T> = {
  data: T;
};
