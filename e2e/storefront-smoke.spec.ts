import { expect, test } from "./fixtures/smoke";

function isApiRequest(url: string, method: string, pathname: string) {
  return method === "POST" && new URL(url).pathname === pathname;
}

test("trang chủ render shell và tìm kiếm từ header", { tag: "@smoke" }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("main section").first().hover();

  await expect(page.getByRole("link", { name: "Logo Vela Wear" }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Vela Wear — Bộ Sưu Tập Thu 2026" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Đăng nhập", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Giỏ hàng" })).toBeVisible();

  await page.getByPlaceholder("Tìm kiếm sản phẩm...").fill("linen shirt");
  await page.getByPlaceholder("Tìm kiếm sản phẩm...").press("Enter");

  await expect(page).toHaveURL((url) =>
    url.pathname === "/search" && url.searchParams.get("q") === "linen shirt"
  );
});

test("form đăng nhập chặn dữ liệu rỗng trước khi gọi API", { tag: "@smoke" }, async ({ page }) => {
  let loginRequestCount = 0;
  page.on("request", (request) => {
    if (isApiRequest(request.url(), request.method(), "/api/v1/auth/login")) {
      loginRequestCount += 1;
    }
  });

  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel("Email*")).toBeVisible();
  await expect(page.getByLabel("Mật khẩu*")).toBeVisible();
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

  await expect(page.getByText("Không được để trống", { exact: true })).toHaveCount(2);
  expect(loginRequestCount).toBe(0);
});

test("giỏ hàng cập nhật từ UI và còn nguyên sau reload", { tag: "@smoke" }, async ({ page }) => {
  const productName = "Áo sơ mi linen cổ điển";
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const productCard = page.getByRole("article", { name: productName });
  await productCard.scrollIntoViewIfNeeded();
  await productCard.hover();
  const addToBag = productCard.getByRole("button", { name: "Thêm vào giỏ" });
  await expect(addToBag).toBeVisible();
  await addToBag.click();

  const shoppingBag = page.getByRole("button", { name: "Giỏ hàng" });
  await expect(shoppingBag.getByText("1", { exact: true })).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("button", { name: "Giỏ hàng" }).getByText("1", { exact: true }),
  ).toBeVisible();
  await page.locator('header a[href="/cart"]').click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole("heading", { name: "Giỏ hàng", exact: true })).toBeVisible();
  await expect(page.getByText(productName, { exact: true }).first()).toBeVisible();
});
