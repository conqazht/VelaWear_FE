import { describe, expect, it, vi } from "vitest";

import {
  createEmptySaleCampaignForm,
  saveSaleCampaignWithTranslations,
  serializeSaleCampaignTranslations,
  toCreateSaleCampaignRequest,
  validateSaleCampaignForm,
} from "@/app/(admin)/dashboard/sales/_data/sale-campaign-form";
import { interpolateMessage } from "@/lib/i18n/define-messages";
import { salesAdminManagementMessages } from "@/lib/i18n/messages/sales-admin-management";
import type { AdminSaleCampaign } from "@/lib/api/admin-sales";

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

  it("không chặn lưu khi bỏ trống toàn bộ English", () => {
    const values = validValues();

    expect(validateSaleCampaignForm(values)).toEqual({ valid: true });
    expect(serializeSaleCampaignTranslations(values)).toEqual([
      {
        localeCode: "vi",
        name: "Summer 2026",
        description: null,
      },
    ]);
  });

  it("trim và serialize đủ bản dịch Sale khi có English", () => {
    const values = validValues();
    values.name = "  Hè 2026  ";
    values.description = "  Ưu đãi mùa hè  ";
    values.englishName = "  Summer 2026  ";
    values.englishDescription = "  Summer offers  ";

    expect(serializeSaleCampaignTranslations(values)).toEqual([
      {
        localeCode: "vi",
        name: "Hè 2026",
        description: "Ưu đãi mùa hè",
      },
      {
        localeCode: "en",
        name: "Summer 2026",
        description: "Summer offers",
      },
    ]);
  });

  it("chặn mô tả English bị nhập dở nhưng chưa có tên", () => {
    const values = validValues();
    values.englishDescription = "Summer offers";

    expect(validateSaleCampaignForm(values)).toMatchObject({
      valid: false,
      step: 1,
    });
  });

  it("retry translation failure updates the persisted campaign without a second POST", async () => {
    const values = validValues();
    const baseCampaign = {
      id: 91,
      code: values.code,
      name: values.name,
      description: null,
      bannerUrl: null,
      type: "STANDARD" as const,
      status: "DRAFT" as const,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      version: 1,
      items: [],
      createdAt: "2026-07-15T00:00:00.000Z",
      updatedAt: "2026-07-15T00:00:00.000Z",
    };
    const createCampaign = vi.fn().mockResolvedValue(baseCampaign);
    const updateCampaign = vi.fn().mockResolvedValue({
      ...baseCampaign,
      version: 2,
    });
    const saveTranslations = vi
      .fn()
      .mockRejectedValueOnce(new Error("translation unavailable"))
      .mockResolvedValueOnce({ ...baseCampaign, version: 3 });
    let persistedCampaign: AdminSaleCampaign | undefined;
    const onBasePersisted = (saved: AdminSaleCampaign) => {
      persistedCampaign = saved;
    };

    await expect(
      saveSaleCampaignWithTranslations({
        campaign: persistedCampaign,
        values,
        createCampaign,
        updateCampaign,
        saveTranslations,
        onBasePersisted,
      }),
    ).rejects.toThrow("translation unavailable");
    expect(persistedCampaign?.id).toBe(91);

    await saveSaleCampaignWithTranslations({
      campaign: persistedCampaign,
      values,
      createCampaign,
      updateCampaign,
      saveTranslations,
      onBasePersisted,
    });

    expect(createCampaign).toHaveBeenCalledOnce();
    expect(updateCampaign).toHaveBeenCalledOnce();
    expect(updateCampaign).toHaveBeenCalledWith(
      expect.objectContaining({ id: 91 }),
    );
  });
});
