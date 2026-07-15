"use client";

import { ContentLocaleTabs } from "@/app/(admin)/dashboard/_components/management/content-locale-tabs";
import { EnglishContentGenerator } from "@/app/(admin)/dashboard/_components/management/english-content-generator";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/providers/i18n-provider";
import type { SaleCampaignType } from "@/lib/api/admin-sales";
import type { Locale } from "@/lib/i18n";
import type { GeminiContentModel } from "@/lib/api/admin-translation-suggestions";

import type { SaleCampaignFormValues } from "../_data/sale-campaign-form";

type CampaignDetailsStepProps = {
  values: SaleCampaignFormValues;
  onChange: (next: SaleCampaignFormValues) => void;
  codeDisabled: boolean;
  displayDisabled: boolean;
  typeAndScheduleDisabled: boolean;
  contentLocale: Locale;
  onContentLocaleChange: (locale: Locale) => void;
  isGeneratingEnglish: boolean;
  interactionDisabled?: boolean;
  onGenerateEnglish: (model: GeminiContentModel) => void | Promise<void>;
};

export function CampaignDetailsStep({
  values,
  onChange,
  codeDisabled,
  displayDisabled,
  typeAndScheduleDisabled,
  contentLocale,
  onContentLocaleChange,
  isGeneratingEnglish,
  interactionDisabled = false,
  onGenerateEnglish,
}: CampaignDetailsStepProps) {
  const { t } = useI18n();

  function update<Key extends keyof SaleCampaignFormValues>(
    key: Key,
    value: SaleCampaignFormValues[Key],
  ) {
    onChange({ ...values, [key]: value });
  }

  function updateType(type: SaleCampaignType) {
    onChange({
      ...values,
      type,
      items: values.items.map((item) => ({
        ...item,
        quota: type === "FLASH" ? item.quota || "1" : "",
        maxPerCustomer: type === "FLASH" ? item.maxPerCustomer : "",
      })),
    });
  }

  return (
    <fieldset
      disabled={interactionDisabled}
      className="grid min-w-0 gap-6 border-0 p-0"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="sale-code">
            {t("admin.sales.editor.details.code.label")}
          </FieldLabel>
          <Input
            id="sale-code"
            value={values.code}
            onChange={(event) => update("code", event.target.value.toUpperCase())}
            placeholder={t("admin.sales.editor.details.code.placeholder")}
            maxLength={50}
            disabled={codeDisabled}
            required
          />
          <FieldDescription>
            {t("admin.sales.editor.details.code.description")}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="sale-type">
            {t("admin.sales.editor.details.type.label")}
          </FieldLabel>
          <Select
            value={values.type}
            onValueChange={(value) => updateType(value as SaleCampaignType)}
            disabled={typeAndScheduleDisabled}
          >
            <SelectTrigger id="sale-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectItem value="STANDARD">
                {t("admin.sales.editor.type.standard")}
              </SelectItem>
              <SelectItem value="FLASH">
                {t("admin.sales.editor.type.flash")}
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            {values.type === "FLASH"
              ? t("admin.sales.editor.details.type.flashDescription")
              : t("admin.sales.editor.details.type.standardDescription")}
          </FieldDescription>
        </Field>
      </div>

      <ContentLocaleTabs
        value={contentLocale}
        onValueChange={onContentLocaleChange}
        complete={{ vi: Boolean(values.name.trim()), en: Boolean(values.englishName.trim()) }}
      >
        {{
          vi: (
            <>
              <Field>
                <FieldLabel htmlFor="sale-name-vi">{t("admin.sales.editor.details.name.label")}</FieldLabel>
                <Input id="sale-name-vi" value={values.name} onChange={(event) => update("name", event.target.value)} placeholder={t("admin.sales.editor.details.name.placeholder")} maxLength={150} disabled={displayDisabled} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="sale-description-vi">{t("admin.sales.editor.details.description.label")}</FieldLabel>
                <Textarea id="sale-description-vi" value={values.description} onChange={(event) => update("description", event.target.value)} placeholder={t("admin.sales.editor.details.description.placeholder")} maxLength={2_000} disabled={displayDisabled} rows={4} />
              </Field>
            </>
          ),
          en: (
            <>
              <EnglishContentGenerator
                hasEnglishContent={Boolean(
                  values.englishName.trim() || values.englishDescription.trim(),
                )}
                sourceReady={Boolean(values.name.trim())}
                isPending={isGeneratingEnglish}
                disabled={displayDisabled}
                onGenerate={onGenerateEnglish}
              />
              <Field>
                <FieldLabel htmlFor="sale-name-en">{t("admin.sales.editor.details.name.label")}</FieldLabel>
                <Input id="sale-name-en" value={values.englishName} onChange={(event) => update("englishName", event.target.value)} placeholder={t("admin.sales.editor.details.name.placeholder")} maxLength={150} disabled={displayDisabled} />
              </Field>
              <Field>
                <FieldLabel htmlFor="sale-description-en">{t("admin.sales.editor.details.description.label")}</FieldLabel>
                <Textarea id="sale-description-en" value={values.englishDescription} onChange={(event) => update("englishDescription", event.target.value)} placeholder={t("admin.sales.editor.details.description.placeholder")} maxLength={2_000} disabled={displayDisabled} rows={4} />
              </Field>
            </>
          ),
        }}
      </ContentLocaleTabs>

      <Field>
        <FieldLabel htmlFor="sale-banner">
          {t("admin.sales.editor.details.banner.label")}
        </FieldLabel>
        <Input
          id="sale-banner"
          type="url"
          value={values.bannerUrl}
          onChange={(event) => update("bannerUrl", event.target.value)}
          placeholder={t("admin.sales.editor.details.banner.placeholder")}
          disabled={displayDisabled}
        />
        <FieldDescription>
          {t("admin.sales.editor.details.banner.description")}
        </FieldDescription>
      </Field>

      <div className="grid gap-5 lg:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="sale-starts-at">
            {t("admin.sales.editor.details.startsAt.label")}
          </FieldLabel>
          <Input
            id="sale-starts-at"
            type="datetime-local"
            value={values.startsAt}
            onChange={(event) => update("startsAt", event.target.value)}
            disabled={typeAndScheduleDisabled}
            required
          />
          <FieldDescription>
            {t("admin.sales.editor.details.startsAt.description")}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="sale-ends-at">
            {t("admin.sales.editor.details.endsAt.label")}
          </FieldLabel>
          <Input
            id="sale-ends-at"
            type="datetime-local"
            value={values.endsAt}
            onChange={(event) => update("endsAt", event.target.value)}
            disabled={typeAndScheduleDisabled}
            required
          />
          <FieldDescription>
            {t("admin.sales.editor.details.endsAt.description")}
          </FieldDescription>
        </Field>
      </div>
    </fieldset>
  );
}
