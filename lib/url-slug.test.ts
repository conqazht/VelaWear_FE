import { describe, expect, it } from "vitest";

import { shouldAutoUpdateSlug, toAsciiUrlSlug } from "@/lib/url-slug";

describe("localized URL slug", () => {
  it("creates a lowercase ASCII kebab slug from an English suggestion", () => {
    expect(toAsciiUrlSlug("  Linen & Lụa Blazer — Édition 2026  ")).toBe(
      "linen-lua-blazer-edition-2026",
    );
  });

  it("keeps following the name while the slug is still automatic", () => {
    expect(shouldAutoUpdateSlug("Linen Blazer", "linen-blazer")).toBe(true);
    expect(shouldAutoUpdateSlug("Linen Blazer", "")).toBe(true);
  });

  it("does not overwrite a slug customized by the admin", () => {
    expect(shouldAutoUpdateSlug("Linen Blazer", "premium-linen-jacket")).toBe(false);
  });
});
