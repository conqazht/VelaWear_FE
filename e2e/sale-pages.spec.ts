import { expect, test } from "@playwright/test";

test("trang Standard Sale có nghiệp vụ coupon", async ({ page }) => {
  await page.goto("/sale");
  await expect(page.getByRole("heading", { name: "Sale", exact: true })).toBeVisible();
  await expect(page.getByText(/Standard Sale vẫn có thể dùng coupon/i)).toBeVisible();
});

test("trang Flash Sale nói rõ giỏ hàng không giữ suất", async ({ page }) => {
  await page.goto("/flash-sale");
  await expect(page.getByRole("heading", { name: "Flash Sale", exact: true })).toBeVisible();
  await expect(page.getByText(/Thêm vào giỏ không đồng nghĩa với giữ suất/i)).toBeVisible();
});
