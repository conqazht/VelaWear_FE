import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("trang Standard Sale có nghiệp vụ coupon", { tag: "@smoke" }, async ({ page }) => {
  await page.goto("/sale");
  await expect(page.getByRole("heading", { name: "Sale", exact: true })).toBeVisible();
  await expect(page.getByText(/Standard Sale vẫn có thể dùng coupon/i)).toBeVisible();
});

test("trang Flash Sale nói rõ giỏ hàng không giữ suất", { tag: "@smoke" }, async ({ page }) => {
  await page.goto("/flash-sale");
  await expect(page.getByRole("heading", { name: "Flash Sale", exact: true })).toBeVisible();
  await expect(page.getByText(/Thêm vào giỏ không đồng nghĩa với giữ suất/i)).toBeVisible();
});

test("Flash Sale đổi nội dung và metadata sang English", { tag: "@smoke" }, async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("vela-locale", "en");
  });
  await page.goto("/flash-sale");

  await expect(page.getByText(/Adding an item to your bag does not reserve/i)).toBeVisible();
  await expect(page).toHaveTitle("Flash Sale | VELA WEAR");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Discover limited-time, limited-quantity Flash Sale offers at VELA WEAR.",
  );
});
