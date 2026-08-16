import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { coreMessages } from "./catalog-core";
import { shopMessages } from "./catalog-shop";
import { adminMessages } from "./catalog-admin";

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{([a-zA-Z0-9_]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1)).sort();
}

describe("catalog-audit", () => {
  it("enforces EN/VI key parity and placeholder match for coreMessages", () => {
    const enKeys = Object.keys(coreMessages.en).sort();
    const viKeys = Object.keys(coreMessages.vi).sort();
    expect(enKeys).toEqual(viKeys);

    for (const key of enKeys) {
      const enText = coreMessages.en[key as keyof typeof coreMessages.en];
      const viText = coreMessages.vi[key as keyof typeof coreMessages.vi];
      expect(extractPlaceholders(enText)).toEqual(extractPlaceholders(viText));
    }
  });

  it("enforces EN/VI key parity and placeholder match for shopMessages", () => {
    const enKeys = Object.keys(shopMessages.en).sort();
    const viKeys = Object.keys(shopMessages.vi).sort();
    expect(enKeys).toEqual(viKeys);

    for (const key of enKeys) {
      const enText = shopMessages.en[key as keyof typeof shopMessages.en];
      const viText = shopMessages.vi[key as keyof typeof shopMessages.vi];
      expect(extractPlaceholders(enText)).toEqual(extractPlaceholders(viText));
    }
  });

  it("enforces EN/VI key parity and placeholder match for adminMessages", () => {
    const enKeys = Object.keys(adminMessages.en).sort();
    const viKeys = Object.keys(adminMessages.vi).sort();
    expect(enKeys).toEqual(viKeys);

    for (const key of enKeys) {
      const enText = adminMessages.en[key as keyof typeof adminMessages.en];
      const viText = adminMessages.vi[key as keyof typeof adminMessages.vi];
      expect(extractPlaceholders(enText)).toEqual(extractPlaceholders(viText));
    }
  });

  it("enforces zero duplicate keys across core, shop, and admin catalogs", () => {
    const coreKeys = new Set(Object.keys(coreMessages.en));
    const shopKeys = new Set(Object.keys(shopMessages.en));
    const adminKeys = new Set(Object.keys(adminMessages.en));

    const coreShopOverlap = [...coreKeys].filter((k) => shopKeys.has(k));
    const coreAdminOverlap = [...coreKeys].filter((k) => adminKeys.has(k));
    const shopAdminOverlap = [...shopKeys].filter((k) => adminKeys.has(k));

    expect(coreShopOverlap).toEqual([]);
    expect(coreAdminOverlap).toEqual([]);
    expect(shopAdminOverlap).toEqual([]);
  });

  it("verifies layout imports according to catalog splitting rules", () => {
    const rootLayout = fs.readFileSync(path.resolve(process.cwd(), "app/layout.tsx"), "utf-8");
    const shopLayout = fs.readFileSync(
      path.resolve(process.cwd(), "app/(shop)/layout.tsx"),
      "utf-8",
    );
    const adminLayout = fs.readFileSync(
      path.resolve(process.cwd(), "app/(admin)/layout.tsx"),
      "utf-8",
    );

    // Root layout should not import shop or admin catalogs
    expect(rootLayout).not.toMatch(/shopMessages|adminMessages|catalogShop|catalogAdmin/);

    // Shop layout should import shopMessages and I18nCatalogProvider, but not adminMessages
    expect(shopLayout).toMatch(/I18nCatalogProvider/);
    expect(shopLayout).toMatch(/shopMessages/);
    expect(shopLayout).not.toMatch(/adminMessages/);

    // Admin layout should import adminMessages and I18nCatalogProvider, but not shopMessages
    expect(adminLayout).toMatch(/I18nCatalogProvider/);
    expect(adminLayout).toMatch(/adminMessages/);
    expect(adminLayout).not.toMatch(/shopMessages/);
  });
});
