import { describe, expect, it } from "vitest";

import {
  EMPTY_CATEGORY_TRANSLATION,
  isCategoryTranslationComplete,
  isCategoryTranslationEmpty,
  serializeCategoryTranslation,
} from "@/app/(admin)/dashboard/categories/_components/category-form";
import {
  EMPTY_PRODUCT_TRANSLATION,
  isProductTranslationComplete,
  isProductTranslationEmpty,
  serializeProductTranslation,
} from "@/app/(admin)/dashboard/products/_components/product-form";

describe("admin content translation serialization", () => {
  it("trim Product fields and serializes blank optional fields as null", () => {
    const translation = {
      ...EMPTY_PRODUCT_TRANSLATION,
      name: "  Linen blazer  ",
      slug: "  linen-blazer  ",
      shortDescription: "  Tailored linen  ",
      material: "   ",
      seoTitle: "  Linen blazer | VELA  ",
    };

    expect(isProductTranslationComplete(translation)).toBe(true);
    expect(serializeProductTranslation("en", translation)).toEqual({
      localeCode: "en",
      name: "Linen blazer",
      slug: "linen-blazer",
      shortDescription: "Tailored linen",
      description: null,
      material: null,
      careInstruction: null,
      seoTitle: "Linen blazer | VELA",
      seoDescription: null,
    });
  });

  it("treats fully blank Product English as optional fallback content", () => {
    expect(isProductTranslationEmpty({ ...EMPTY_PRODUCT_TRANSLATION })).toBe(true);
    expect(isProductTranslationComplete({ ...EMPTY_PRODUCT_TRANSLATION })).toBe(false);
  });

  it("trim Category fields and preserves its localized slug", () => {
    const translation = {
      ...EMPTY_CATEGORY_TRANSLATION,
      name: "  Tailoring  ",
      slug: "  tailoring  ",
      description: "  Modern tailoring  ",
    };

    expect(isCategoryTranslationComplete(translation)).toBe(true);
    expect(serializeCategoryTranslation("en", translation)).toEqual({
      localeCode: "en",
      name: "Tailoring",
      slug: "tailoring",
      description: "Modern tailoring",
      seoTitle: null,
      seoDescription: null,
    });
  });

  it("treats fully blank Category English as optional fallback content", () => {
    expect(isCategoryTranslationEmpty({ ...EMPTY_CATEGORY_TRANSLATION })).toBe(true);
    expect(isCategoryTranslationComplete({ ...EMPTY_CATEGORY_TRANSLATION })).toBe(false);
  });
});
