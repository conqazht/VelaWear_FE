import { describe, expect, it } from "vitest";
import {
  getProfileTabId,
  formatDisplayDate,
  formatMemberSince,
  formatAddress,
  orderStatusMeta,
  orderStatusLabelKeys,
} from "./profile-formatters";
import type { UserAddress } from "@/lib/api/types";

describe("profile-formatters", () => {
  describe("getProfileTabId", () => {
    it("returns valid tab ID when given a valid tab string", () => {
      expect(getProfileTabId("orders")).toBe("orders");
      expect(getProfileTabId("favourites")).toBe("favourites");
      expect(getProfileTabId("coupons")).toBe("coupons");
      expect(getProfileTabId("reviews")).toBe("reviews");
      expect(getProfileTabId("profile")).toBe("profile");
    });

    it("falls back to 'profile' for null, undefined, or invalid strings", () => {
      expect(getProfileTabId(null)).toBe("profile");
      expect(getProfileTabId("invalid-tab")).toBe("profile");
      expect(getProfileTabId("")).toBe("profile");
    });
  });

  describe("formatDisplayDate", () => {
    it("returns empty string when date is null or invalid", () => {
      expect(formatDisplayDate(null, "vi")).toBe("");
      expect(formatDisplayDate(undefined, "vi")).toBe("");
      expect(formatDisplayDate("invalid-date", "vi")).toBe("");
    });

    it("formats valid date string correctly", () => {
      const result = formatDisplayDate("2026-05-15T10:00:00Z", "vi");
      expect(result).toBeTruthy();
    });
  });

  describe("formatMemberSince", () => {
    it("returns default date formatted when input is null, undefined, or invalid", () => {
      const defaultVi = formatMemberSince(null, "vi");
      expect(defaultVi).toBeTruthy();

      const invalidVi = formatMemberSince("invalid-date", "vi");
      expect(invalidVi).toBe(defaultVi);
    });

    it("formats valid member since date correctly", () => {
      const result = formatMemberSince("2025-01-01T00:00:00Z", "en");
      expect(result).toBeTruthy();
    });
  });

  describe("formatAddress", () => {
    it("joins non-empty address fields with comma", () => {
      const address: UserAddress = {
        id: 1,
        userId: 10,
        receiverName: "John Doe",
        phone: "0123456789",
        addressDetail: "123 Main St",
        ward: "Ward 1",
        province: "Hanoi",
        isDefault: true,
      };
      expect(formatAddress(address)).toBe("123 Main St, Ward 1, Hanoi");
    });

    it("filters out empty address fields", () => {
      const address: UserAddress = {
        id: 2,
        userId: 10,
        receiverName: "Jane Doe",
        phone: "0987654321",
        addressDetail: "456 Side St",
        ward: "",
        province: "HCM",
        isDefault: false,
      };
      expect(formatAddress(address)).toBe("456 Side St, HCM");
    });
  });

  describe("orderStatusMeta & orderStatusLabelKeys", () => {
    it("has metadata for all known order statuses", () => {
      const statuses = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED", "REFUNDED"];
      statuses.forEach((status) => {
        expect(orderStatusMeta[status]).toBeDefined();
        expect(orderStatusMeta[status].badge).toBeTruthy();
        expect(orderStatusMeta[status].dot).toBeTruthy();
        expect(orderStatusLabelKeys[status as keyof typeof orderStatusLabelKeys]).toBeDefined();
      });
    });
  });
});
