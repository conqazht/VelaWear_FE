import { expect, test } from "vitest";
import * as fs from "fs";
import * as path from "path";

function walkDir(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walkDir(path.join(dir, file), fileList);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

test("shop providers should not be consumed outside shop routes", () => {
  const appFiles = walkDir(path.join(process.cwd(), "app"));
  const componentsFiles = walkDir(path.join(process.cwd(), "components"));
  const allFiles = [...appFiles, ...componentsFiles];

  const allowedShopComponents = [
    path.join("components", "shop", "checkout-page-client.tsx"),
    path.join("components", "shop", "cart-provider.tsx"),
    path.join("components", "shop", "cart-provider.test.tsx"),
    path.join("components", "shop", "cart-page-client.tsx"),
    path.join("components", "shop", "favorites-provider.tsx"),
    path.join("components", "shop", "favorites-provider.test.tsx"),
    path.join("components", "shop", "favorites-page-client.tsx"),
    path.join("components", "shop", "home-product-card.tsx"),
    path.join("components", "shop", "notification-provider.tsx"),
    path.join("components", "shop", "product-detail-client.tsx"),
    path.join("components", "shop", "site-header.tsx"),
  ].map((p) => p.replace(/\\/g, "/"));

  for (const file of allFiles) {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, "/");
    const content = fs.readFileSync(file, "utf8");

    const hasConsumer = /useCart\(|useFavorites\(|useNotification\(/.test(content);
    if (hasConsumer) {
      const isShopRoute = relativePath.startsWith("app/(shop)/");
      const isAllowedComponent = allowedShopComponents.includes(relativePath);

      if (!isShopRoute && !isAllowedComponent) {
        throw new Error(`Shop provider consumed outside shop boundary in: ${relativePath}`);
      }
    }
  }
});

test("root layout should not import or use shop providers", () => {
  const layoutPath = path.join(process.cwd(), "app", "layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf8");

  expect(content).not.toMatch(/CartProvider/);
  expect(content).not.toMatch(/NotificationProvider/);
  expect(content).not.toMatch(/FavoritesProvider/);
});
