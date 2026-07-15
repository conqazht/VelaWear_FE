"use client";

import { ContentLocaleTabs } from "@/app/(admin)/dashboard/_components/management/content-locale-tabs";
import { EnglishContentGenerator } from "@/app/(admin)/dashboard/_components/management/english-content-generator";
import { useI18n } from "@/components/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminCatalogOption,
  ProductStatus,
  ProductTranslation,
} from "@/lib/api/admin-commerce";
import type { Locale } from "@/lib/i18n";
import type { GeminiContentModel } from "@/lib/api/admin-translation-suggestions";
import { shouldAutoUpdateSlug, toAsciiUrlSlug } from "@/lib/url-slug";

export type ProductTranslationFormValue = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  material: string;
  careInstruction: string;
  seoTitle: string;
  seoDescription: string;
};

export type ProductFormValues = {
  categoryId: string;
  brandId: string;
  status: ProductStatus;
  translations: Record<Locale, ProductTranslationFormValue>;
};

export const EMPTY_PRODUCT_TRANSLATION: ProductTranslationFormValue = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  material: "",
  careInstruction: "",
  seoTitle: "",
  seoDescription: "",
};

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  categoryId: "",
  brandId: "",
  status: "DRAFT",
  translations: {
    vi: { ...EMPTY_PRODUCT_TRANSLATION },
    en: { ...EMPTY_PRODUCT_TRANSLATION },
  },
};

export function isProductTranslationComplete(value: ProductTranslationFormValue) {
  return Boolean(value.name.trim() && value.slug.trim());
}

export function isProductTranslationEmpty(value: ProductTranslationFormValue) {
  return Object.values(value).every((field) => !field.trim());
}

export function serializeProductTranslation(
  localeCode: Locale,
  value: ProductTranslationFormValue,
): ProductTranslation {
  const nullable = (field: string) => field.trim() || null;
  return {
    localeCode,
    name: value.name.trim(),
    slug: value.slug.trim(),
    shortDescription: nullable(value.shortDescription),
    description: nullable(value.description),
    material: nullable(value.material),
    careInstruction: nullable(value.careInstruction),
    seoTitle: nullable(value.seoTitle),
    seoDescription: nullable(value.seoDescription),
  };
}

type ProductFormProps = {
  values: ProductFormValues;
  onChange: (next: ProductFormValues) => void;
  contentLocale: Locale;
  onContentLocaleChange: (locale: Locale) => void;
  categories: AdminCatalogOption[];
  brands: AdminCatalogOption[];
  isCatalogLoading?: boolean;
  catalogError?: string | null;
  isGeneratingEnglish: boolean;
  onGenerateEnglish: (model: GeminiContentModel) => void | Promise<void>;
};

const PRODUCT_STATUS_MESSAGE_KEYS = {
  DRAFT: "admin.commerce.products.status.draft",
  ACTIVE: "admin.commerce.products.status.active",
  INACTIVE: "admin.commerce.products.status.inactive",
  OUT_OF_STOCK: "admin.commerce.products.status.outOfStock",
} as const;

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"];

export function ProductForm({
  values,
  onChange,
  contentLocale,
  onContentLocaleChange,
  categories,
  brands,
  isCatalogLoading = false,
  catalogError,
  isGeneratingEnglish,
  onGenerateEnglish,
}: ProductFormProps) {
  const { t } = useI18n();

  function updateShared<Key extends "categoryId" | "brandId" | "status">(
    key: Key,
    value: ProductFormValues[Key],
  ) {
    onChange({ ...values, [key]: value });
  }

  function updateTranslation(
    locale: Locale,
    key: keyof ProductTranslationFormValue,
    value: string,
  ) {
    const currentTranslation = values.translations[locale];
    const nextTranslation = { ...currentTranslation, [key]: value };
    if (
      locale === "en" &&
      key === "name" &&
      shouldAutoUpdateSlug(currentTranslation.name, currentTranslation.slug)
    ) {
      nextTranslation.slug = toAsciiUrlSlug(value);
    }
    onChange({
      ...values,
      translations: {
        ...values.translations,
        [locale]: nextTranslation,
      },
    });
  }

  const translationFields = (locale: Locale) => {
    const translation = values.translations[locale];
    const idPrefix = `product-${locale}`;
    return (
      <>
        {locale === "en" ? (
          <EnglishContentGenerator
            hasEnglishContent={!isProductTranslationEmpty(values.translations.en)}
            sourceReady={Boolean(values.translations.vi.name.trim())}
            isPending={isGeneratingEnglish}
            onGenerate={onGenerateEnglish}
          />
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-name`}>
              {t("admin.commerce.products.form.name")}
            </FieldLabel>
            <Input
              id={`${idPrefix}-name`}
              value={translation.name}
              onChange={(event) => updateTranslation(locale, "name", event.target.value)}
              maxLength={255}
              placeholder={t("admin.commerce.products.form.namePlaceholder")}
              required={locale === "vi"}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`${idPrefix}-slug`}>
              {t("admin.commerce.products.form.slug")}
            </FieldLabel>
            <Input
              id={`${idPrefix}-slug`}
              value={translation.slug}
              onChange={(event) => updateTranslation(locale, "slug", event.target.value.toLowerCase())}
              maxLength={280}
              placeholder="structured-linen-blazer"
              required={locale === "vi"}
            />
            <FieldDescription>{t("admin.commerce.products.form.slugHelp")}</FieldDescription>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor={`${idPrefix}-short-description`}>
            {t("admin.commerce.products.form.shortDescription")}
          </FieldLabel>
          <Textarea
            id={`${idPrefix}-short-description`}
            value={translation.shortDescription}
            onChange={(event) => updateTranslation(locale, "shortDescription", event.target.value)}
            placeholder={t("admin.commerce.products.form.shortDescriptionPlaceholder")}
            rows={3}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`${idPrefix}-description`}>
            {t("admin.commerce.products.form.description")}
          </FieldLabel>
          <Textarea
            id={`${idPrefix}-description`}
            value={translation.description}
            onChange={(event) => updateTranslation(locale, "description", event.target.value)}
            placeholder={t("admin.commerce.products.form.descriptionPlaceholder")}
            rows={6}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-material`}>
              {t("admin.commerce.products.form.material")}
            </FieldLabel>
            <Input
              id={`${idPrefix}-material`}
              value={translation.material}
              onChange={(event) => updateTranslation(locale, "material", event.target.value)}
              placeholder={t("admin.commerce.products.form.materialPlaceholder")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-care`}>
              {t("admin.commerce.products.form.careInstruction")}
            </FieldLabel>
            <Input
              id={`${idPrefix}-care`}
              value={translation.careInstruction}
              onChange={(event) => updateTranslation(locale, "careInstruction", event.target.value)}
              placeholder={t("admin.commerce.products.form.careInstructionPlaceholder")}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-seo-title`}>
              {t("admin.commerce.products.form.seoTitle")}
            </FieldLabel>
            <Input
              id={`${idPrefix}-seo-title`}
              value={translation.seoTitle}
              onChange={(event) => updateTranslation(locale, "seoTitle", event.target.value)}
              maxLength={255}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-seo-description`}>
              {t("admin.commerce.products.form.seoDescription")}
            </FieldLabel>
            <Textarea
              id={`${idPrefix}-seo-description`}
              value={translation.seoDescription}
              onChange={(event) => updateTranslation(locale, "seoDescription", event.target.value)}
              rows={3}
            />
          </Field>
        </div>
      </>
    );
  };

  return (
    <FieldGroup>
      {catalogError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.products.form.catalogUnavailable")}</AlertTitle>
          <AlertDescription>{catalogError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="product-category">{t("admin.commerce.products.form.category")}</FieldLabel>
          <Select
            value={values.categoryId || null}
            onValueChange={(value) => updateShared("categoryId", value ?? "")}
            disabled={isCatalogLoading}
          >
            <SelectTrigger id="product-category" className="w-full">
              <SelectValue placeholder={isCatalogLoading ? t("admin.commerce.products.form.loadingCategories") : t("admin.commerce.products.form.selectCategory")} />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="product-brand">{t("admin.commerce.products.form.brand")}</FieldLabel>
          <Select
            value={values.brandId || null}
            onValueChange={(value) => updateShared("brandId", value ?? "")}
            disabled={isCatalogLoading}
          >
            <SelectTrigger id="product-brand" className="w-full">
              <SelectValue placeholder={isCatalogLoading ? t("admin.commerce.products.form.loadingBrands") : t("admin.commerce.products.form.selectBrand")} />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {brands.map((brand) => <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <ContentLocaleTabs
        value={contentLocale}
        onValueChange={onContentLocaleChange}
        complete={{
          vi: isProductTranslationComplete(values.translations.vi),
          en: isProductTranslationComplete(values.translations.en),
        }}
      >
        {{ vi: translationFields("vi"), en: translationFields("en") }}
      </ContentLocaleTabs>

      <Field>
        <FieldLabel htmlFor="product-status">{t("admin.commerce.products.form.status")}</FieldLabel>
        <Select value={values.status} onValueChange={(value) => updateShared("status", value as ProductStatus)}>
          <SelectTrigger id="product-status" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {PRODUCT_STATUSES.map((status) => <SelectItem key={status} value={status}>{t(PRODUCT_STATUS_MESSAGE_KEYS[status])}</SelectItem>)}
          </SelectContent>
        </Select>
        <FieldDescription>{t("admin.commerce.products.form.statusHelp")}</FieldDescription>
      </Field>
    </FieldGroup>
  );
}
