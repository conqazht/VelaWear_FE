import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { I18nProvider } from "@/components/providers/i18n-provider";
import { createEmptySaleCampaignForm } from "@/app/(admin)/dashboard/sales/_data/sale-campaign-form";
import { CampaignDetailsStep } from "@/app/(admin)/dashboard/sales/_components/campaign-details-step";
import { CampaignStepper } from "@/app/(admin)/dashboard/sales/_components/campaign-stepper";

describe("Sale English generation interaction lock", () => {
  it("prevents step navigation while the Gemini request is pending", async () => {
    const onStepChange = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="vi">
        <CampaignStepper currentStep={1} onStepChange={onStepChange} disabled />
      </I18nProvider>,
    );

    const productStep = screen.getByRole("button", { name: /Sản phẩm và giá/i });
    expect(productStep).toBeDisabled();
    await user.click(productStep);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("locks VI and EN details so a pending response cannot overwrite newer typing", () => {
    const values = {
      ...createEmptySaleCampaignForm(),
      code: "SUMMER_2026",
      name: "Ưu đãi mùa hè",
      description: "Nội dung tiếng Việt",
      englishName: "Summer sale",
      englishDescription: "Existing English content",
    };
    const details = (contentLocale: "vi" | "en") => (
      <I18nProvider initialLocale="vi">
        <CampaignDetailsStep
          values={values}
          onChange={vi.fn()}
          codeDisabled={false}
          displayDisabled={false}
          typeAndScheduleDisabled={false}
          contentLocale={contentLocale}
          onContentLocaleChange={vi.fn()}
          isGeneratingEnglish
          interactionDisabled
          onGenerateEnglish={vi.fn()}
        />
      </I18nProvider>
    );
    const { container, rerender } = render(details("vi"));

    expect(container.querySelector("fieldset")).toBeDisabled();
    expect(container.querySelector("#sale-name-vi")).toBeDisabled();
    expect(container.querySelector("#sale-description-vi")).toBeDisabled();

    rerender(details("en"));
    expect(container.querySelector("#sale-name-en")).toBeDisabled();
    expect(container.querySelector("#sale-description-en")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Đang tạo nội dung English/i }),
    ).toBeDisabled();
  });
});
