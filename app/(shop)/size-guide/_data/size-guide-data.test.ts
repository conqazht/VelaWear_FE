import { describe, expect, it } from "vitest";

import {
  createSizeGuideHref,
  formatMeasurement,
  parseAvailableSizes,
  PLUS_BODY_SIZES,
  STANDARD_BODY_SIZES,
} from "./size-guide-data";

describe("size guide reference data", () => {
  it("keeps the supplied standard and extended measurements", () => {
    expect(STANDARD_BODY_SIZES.find((item) => item.size === "M")).toEqual({
      size: "M",
      bust: [90, 97],
      waist: [74, 81],
      hip: [98, 105],
    });
    expect(PLUS_BODY_SIZES.find((item) => item.size === "4X")?.hip).toEqual([155, 165]);
  });

  it("converts centimeters to inches with one decimal place", () => {
    expect(formatMeasurement([90, 97], "cm")).toBe("90–97");
    expect(formatMeasurement([90, 97], "in")).toBe("35.4–38.2");
    expect(formatMeasurement(28, "in")).toBe("11.0");
  });

  it("carries PDP category, selection and availability into the guide URL", () => {
    const href = createSizeGuideHref({
      categorySlug: "ao",
      selectedSize: "M",
      productSlug: "essential-cotton-tee",
      availableSizes: ["S", "M", "L", "M"],
    });
    const url = new URL(href, "https://vela.test");

    expect(url.pathname).toBe("/size-guide");
    expect(url.searchParams.get("category")).toBe("ao");
    expect(url.searchParams.get("size")).toBe("M");
    expect(parseAvailableSizes(url.searchParams.get("available"))).toEqual(new Set(["S", "M", "L"]));
  });
});
