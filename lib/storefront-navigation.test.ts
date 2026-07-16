import { describe, expect, it } from "vitest";

import { getStorefrontNavigation } from "@/lib/storefront-navigation";

describe("storefront mega-menu configuration", () => {
  it("gives every desktop and mobile leaf a navigable storefront URL", () => {
    const navigation = getStorefrontNavigation("vi");
    const leaves = navigation.flatMap((item) => item.groups?.flatMap((group) => group.items) ?? []);

    expect(navigation.map((item) => item.label)).toEqual([
      "Giảm giá",
      "Bộ sưu tập",
      "Áo",
      "Quần",
      "Váy & Đầm",
      "Phụ kiện & Giày",
      "Trợ giúp",
    ]);
    expect(leaves.length).toBeGreaterThan(30);
    expect(leaves.every((item) => item.href.startsWith("/"))).toBe(true);
    expect(leaves.find((item) => item.label === "Cargo")?.href).toContain("categories=quan");
    expect(leaves.find((item) => item.label === "Cargo")?.href).toContain("q=cargo");
    expect(leaves.find((item) => item.label === "Móc khóa")?.href).toContain("categories=phu-kien");
  });

  it("builds localized search terms while preserving stable category slugs", () => {
    const navigation = getStorefrontNavigation("en");
    const leaves = navigation.flatMap((item) => item.groups?.flatMap((group) => group.items) ?? []);
    const tShirt = leaves.find((item) => item.label === "T-shirts");

    expect(tShirt?.href).toContain("categories=ao");
    expect(tShirt?.href).toContain("q=tee");
  });
});
