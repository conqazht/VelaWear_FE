import { describe, expect, it } from "vitest";

import {
  createEmptySaleCampaignForm,
  toCreateSaleCampaignRequest,
  validateSaleCampaignForm,
} from "@/app/(admin)/dashboard/sales/_data/sale-campaign-form";
import { interpolateMessage } from "@/lib/i18n/define-messages";
import { salesAdminManagementMessages } from "@/lib/i18n/messages/sales-admin-management";

function validValues() {
  const values = createEmptySaleCampaignForm();
  values.code = "SUMMER_2026";
  values.name = "Summer 2026";
  values.items = [
    {
      variantId: 10,
      productId: 1,
      productName: "Áo linen",
      sku: "AO-LINEN-M",
      colorName: "Kem",
      sizeName: "M",
      referencePrice: 500_000,
      promotionalPrice: "400000",
      quota: "",
      reservedQuantity: 0,
      soldQuantity: 0,
      maxPerCustomer: "",
    },
  ];
  return values;
}

describe("sale campaign admin form", () => {
  it("không gửi quota/customer limit cho Standard Sale", () => {
    const values = validValues();
    values.items[0].quota = "50";
    values.items[0].maxPerCustomer = "2";

    expect(toCreateSaleCampaignRequest(values).items[0]).toMatchObject({
      quota: null,
      maxPerCustomer: null,
    });
  });

  it("bắt Flash Sale phải có quota nguyên dương", () => {
    const values = validValues();
    values.type = "FLASH";
    values.items[0].quota = "0";

    expect(validateSaleCampaignForm(values)).toMatchObject({
      valid: false,
      step: 2,
    });
  });

  it("không cho giá promotional bằng hoặc cao hơn giá tham chiếu", () => {
    const values = validValues();
    values.items[0].promotionalPrice = "500000";

    expect(validateSaleCampaignForm(values)).toMatchObject({
      valid: false,
      step: 2,
    });
  });

  it("trả validation message theo translator được truyền vào", () => {
    const values = validValues();
    values.name = "";

    expect(
      validateSaleCampaignForm(values, {
        t: (key, variables) =>
          interpolateMessage(salesAdminManagementMessages.vi[key], variables),
      }),
    ).toMatchObject({
      valid: false,
      step: 1,
      message: "Nhập tên chiến dịch.",
    });
  });

  it("serialize lịch datetime-local thành ISO có timezone rõ ràng", () => {
    const values = validValues();
    const request = toCreateSaleCampaignRequest(values);

    expect(request.startsAt).toMatch(/Z$/);
    expect(request.endsAt).toMatch(/Z$/);
  });
});
