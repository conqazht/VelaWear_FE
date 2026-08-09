import { expect, test } from "./fixtures/smoke";
import { AuthHeaderComponent } from "./pages/components/auth-header.component";

function isApiRequest(url: string, method: string, pathname: string) {
  return method === "POST" && new URL(url).pathname === pathname;
}

test("trang chủ render shell và tìm kiếm từ header", { tag: "@smoke" }, async ({ page }) => {
  const authHeader = new AuthHeaderComponent(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(authHeader.root.getByRole("link", { name: "Logo Vela Wear" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Vela Wear — Bộ Sưu Tập Thu 2026" }),
  ).toBeVisible();
  await expect(authHeader.loginLink).toBeVisible();
  await expect(authHeader.root.getByRole("button", { name: "Giỏ hàng" })).toBeVisible();

  const searchInput = page.getByPlaceholder("Tìm kiếm sản phẩm...");
  await searchInput.fill("linen shirt");
  await searchInput.press("Enter");

  await expect(page).toHaveURL(
    (url) => url.pathname === "/search" && url.searchParams.get("q") === "linen shirt",
    { timeout: 15000 }
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
  const addToBag = productCard.getByRole("button", { name: "Thêm vào giỏ" });
  const shoppingBag = page.getByRole("button", { name: "Giỏ hàng" });

  await productCard.scrollIntoViewIfNeeded();
  await productCard.hover();
  await expect(addToBag).toBeVisible();

  await addToBag.click();

  await expect(shoppingBag.getByText("1", { exact: true })).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(
    shoppingBag.getByText("1", { exact: true }),
  ).toBeVisible();

  await shoppingBag.click();

  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole("heading", { name: "Giỏ hàng", exact: true })).toBeVisible();
  await expect(page.getByText(productName, { exact: true }).first()).toBeVisible();
});
