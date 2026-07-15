import { describe, expect, it } from "vitest";

import {
  getCatalogStatusToggleTarget,
  getProductStatusToggleState,
  getProductStatusToggleTarget,
  getVariantStatusToggleState,
  getVariantStatusToggleTarget,
} from "@/lib/admin-status-toggle";

describe("admin status toggle mapping", () => {
  it("maps Product DRAFT/INACTIVE to ACTIVE and ACTIVE to INACTIVE", () => {
    expect(getProductStatusToggleTarget("DRAFT", true)).toBe("ACTIVE");
    expect(getProductStatusToggleTarget("INACTIVE", true)).toBe("ACTIVE");
    expect(getProductStatusToggleTarget("ACTIVE", false)).toBe("INACTIVE");
    expect(getProductStatusToggleState("DRAFT")).toEqual({
      checked: false,
      disabled: false,
    });
  });

  it("disables Product OUT_OF_STOCK quick toggle", () => {
    expect(getProductStatusToggleState("OUT_OF_STOCK")).toEqual({
      checked: false,
      disabled: true,
    });
    expect(getProductStatusToggleTarget("OUT_OF_STOCK", true)).toBeNull();
  });

  it("maps Category and Brand ACTIVE/INACTIVE", () => {
    expect(getCatalogStatusToggleTarget(true)).toBe("ACTIVE");
    expect(getCatalogStatusToggleTarget(false)).toBe("INACTIVE");
  });

  it("disables Variant OUT_OF_STOCK/DISCONTINUED but maps editable statuses", () => {
    expect(getVariantStatusToggleTarget("ACTIVE", false)).toBe("INACTIVE");
    expect(getVariantStatusToggleTarget("INACTIVE", true)).toBe("ACTIVE");
    expect(getVariantStatusToggleState("OUT_OF_STOCK").disabled).toBe(true);
    expect(getVariantStatusToggleState("DISCONTINUED").disabled).toBe(true);
    expect(getVariantStatusToggleTarget("DISCONTINUED", true)).toBeNull();
  });
});
