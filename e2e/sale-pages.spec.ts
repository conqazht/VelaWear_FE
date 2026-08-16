import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures/smoke";

async function expectEnglishFlashSale(page: Page) {
  await expect(page.getByText(/Adding an item to your bag does not reserve/i)).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-locale", "en");
  await expect(page).toHaveTitle("Flash Sale | VELA WEAR");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Discover limited-time, limited-quantity Flash Sale offers at VELA WEAR.",
  );
}

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

test(
  "Flash Sale giữ nội dung và metadata English sau reload",
  { tag: "@smoke" },
  async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/flash-sale");

    await page.getByRole("button", { name: "Ngôn ngữ: Tiếng Việt" }).click();
    await page
      .getByRole("group", { name: "Ngôn ngữ" })
      .getByRole("button", { name: /Tiếng Anh$/ })
      .click();

    await expectEnglishFlashSale(page);

    await page.reload();

    await expectEnglishFlashSale(page);
    await page.getByRole("button", { name: "Language: English" }).click();
    await expect(
      page.getByRole("group", { name: "Language" }).getByRole("button", { name: /English$/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem("vela-locale")))
      .toBe("en");
  },
);
