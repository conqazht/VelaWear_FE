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
  AdminCatalogStatus,
  AdminCategory,
  CategoryTranslation,
} from "@/lib/api/admin-commerce";
import type { Locale } from "@/lib/i18n";
import type { GeminiContentModel } from "@/lib/api/admin-translation-suggestions";
import { shouldAutoUpdateSlug, toAsciiUrlSlug } from "@/lib/url-slug";

const ROOT_CATEGORY_VALUE = "ROOT";

export type CategoryTranslationFormValue = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export type CategoryFormValues = {
  parentId: string;
  sortOrder: string;
  status: AdminCatalogStatus;
  translations: Record<Locale, CategoryTranslationFormValue>;
};

export const EMPTY_CATEGORY_TRANSLATION: CategoryTranslationFormValue = {
  name: "",
  slug: "",
  description: "",
  seoTitle: "",
  seoDescription: "",
};

export const EMPTY_CATEGORY_FORM: CategoryFormValues = {
  parentId: "",
  sortOrder: "0",
  status: "ACTIVE",
  translations: {
    vi: { ...EMPTY_CATEGORY_TRANSLATION },
    en: { ...EMPTY_CATEGORY_TRANSLATION },
  },
};

export function isCategoryTranslationComplete(value: CategoryTranslationFormValue) {
  return Boolean(value.name.trim() && value.slug.trim());
}

export function isCategoryTranslationEmpty(value: CategoryTranslationFormValue) {
  return Object.values(value).every((field) => !field.trim());
}

export function serializeCategoryTranslation(
  localeCode: Locale,
  value: CategoryTranslationFormValue,
): CategoryTranslation {
  const nullable = (field: string) => field.trim() || null;
  return {
    localeCode,
    name: value.name.trim(),
    slug: value.slug.trim(),
    description: nullable(value.description),
    seoTitle: nullable(value.seoTitle),
    seoDescription: nullable(value.seoDescription),
  };
}

const CATEGORY_STATUS_MESSAGE_KEYS = {
  ACTIVE: "admin.commerce.common.active",
  INACTIVE: "admin.commerce.common.inactive",
} as const;

const CATEGORY_STATUSES: AdminCatalogStatus[] = ["ACTIVE", "INACTIVE"];

type CategoryFormProps = {
  values: CategoryFormValues;
  onChange: (next: CategoryFormValues) => void;
  contentLocale: Locale;
  onContentLocaleChange: (locale: Locale) => void;
  categories: AdminCategory[];
  editingCategoryId: number | null;
  isCatalogLoading?: boolean;
  catalogError?: string | null;
  isGeneratingEnglish: boolean;
  onGenerateEnglish: (model: GeminiContentModel) => void | Promise<void>;
};

export function CategoryForm({
  values,
  onChange,
  contentLocale,
  onContentLocaleChange,
  categories,
  editingCategoryId,
  isCatalogLoading = false,
  catalogError,
  isGeneratingEnglish,
  onGenerateEnglish,
}: CategoryFormProps) {
  const { t } = useI18n();
  const isEditing = editingCategoryId !== null;
  const excludedParentIds = new Set<number>();
  if (editingCategoryId !== null) {
    excludedParentIds.add(editingCategoryId);
    let foundDescendant = true;
    while (foundDescendant) {
      foundDescendant = false;
      for (const category of categories) {
        if (category.parentId !== null && excludedParentIds.has(category.parentId) && !excludedParentIds.has(category.id)) {
          excludedParentIds.add(category.id);
          foundDescendant = true;
        }
      }
    }
  }
  const parentOptions = categories.filter((category) => !excludedParentIds.has(category.id));

  function updateShared<Key extends "parentId" | "sortOrder" | "status">(
    key: Key,
    value: CategoryFormValues[Key],
  ) {
    onChange({ ...values, [key]: value });
  }

  function updateTranslation(
    locale: Locale,
    key: keyof CategoryTranslationFormValue,
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
    const prefix = `category-${locale}`;
    return (
      <>
        {locale === "en" ? (
          <EnglishContentGenerator
            hasEnglishContent={!isCategoryTranslationEmpty(values.translations.en)}
            sourceReady={Boolean(values.translations.vi.name.trim())}
            isPending={isGeneratingEnglish}
            onGenerate={onGenerateEnglish}
          />
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${prefix}-name`}>{t("admin.commerce.categories.form.name")}</FieldLabel>
            <Input
              id={`${prefix}-name`}
              value={translation.name}
              onChange={(event) => updateTranslation(locale, "name", event.target.value)}
              maxLength={150}
              placeholder={t("admin.commerce.categories.form.namePlaceholder")}
              required={locale === "vi"}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${prefix}-slug`}>{t("admin.commerce.categories.form.slug")}</FieldLabel>
            <Input
              id={`${prefix}-slug`}
              value={translation.slug}
              onChange={(event) => updateTranslation(locale, "slug", event.target.value.toLowerCase())}
              maxLength={180}
              placeholder="tailoring"
              spellCheck={false}
              required={locale === "vi"}
            />
            <FieldDescription>{t("admin.commerce.categories.form.slugHelp")}</FieldDescription>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor={`${prefix}-description`}>{t("admin.commerce.categories.form.description")}</FieldLabel>
          <Textarea
            id={`${prefix}-description`}
            value={translation.description}
            onChange={(event) => updateTranslation(locale, "description", event.target.value)}
            placeholder={t("admin.commerce.categories.form.descriptionPlaceholder")}
            rows={5}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`${prefix}-seo-title`}>{t("admin.commerce.categories.form.seoTitle")}</FieldLabel>
            <Input id={`${prefix}-seo-title`} value={translation.seoTitle} onChange={(event) => updateTranslation(locale, "seoTitle", event.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${prefix}-seo-description`}>{t("admin.commerce.categories.form.seoDescription")}</FieldLabel>
            <Textarea id={`${prefix}-seo-description`} value={translation.seoDescription} onChange={(event) => updateTranslation(locale, "seoDescription", event.target.value)} rows={3} />
          </Field>
        </div>
      </>
    );
  };

  return (
    <FieldGroup>
      {catalogError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("admin.commerce.categories.form.parentUnavailable")}</AlertTitle>
          <AlertDescription>{catalogError}</AlertDescription>
        </Alert>
      ) : null}

      <Field>
        <FieldLabel htmlFor="category-parent">{t("admin.commerce.categories.form.parent")}</FieldLabel>
        <Select
          value={values.parentId || ROOT_CATEGORY_VALUE}
          onValueChange={(value) => updateShared("parentId", value === ROOT_CATEGORY_VALUE ? "" : (value ?? ""))}
          disabled={isCatalogLoading}
        >
          <SelectTrigger id="category-parent" className="w-full">
            <SelectValue placeholder={isCatalogLoading ? t("admin.commerce.categories.form.loading") : t("admin.commerce.categories.topLevel")} />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            <SelectItem value={ROOT_CATEGORY_VALUE}>{t("admin.commerce.categories.form.noParent")}</SelectItem>
            {parentOptions.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name} (/{category.originalSlug || category.slug})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>{isEditing ? t("admin.commerce.categories.form.editParentHelp") : t("admin.commerce.categories.form.createParentHelp")}</FieldDescription>
      </Field>

      <ContentLocaleTabs
        value={contentLocale}
        onValueChange={onContentLocaleChange}
        complete={{
          vi: isCategoryTranslationComplete(values.translations.vi),
          en: isCategoryTranslationComplete(values.translations.en),
        }}
      >
        {{ vi: translationFields("vi"), en: translationFields("en") }}
      </ContentLocaleTabs>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="category-sort-order">{t("admin.commerce.categories.form.sortOrder")}</FieldLabel>
          <Input id="category-sort-order" type="number" min={0} step={1} inputMode="numeric" value={values.sortOrder} onChange={(event) => updateShared("sortOrder", event.target.value)} required />
          <FieldDescription>{t("admin.commerce.categories.form.sortOrderHelp")}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="category-status">{t("admin.commerce.common.status")}</FieldLabel>
          <Select value={values.status} onValueChange={(value) => updateShared("status", value as AdminCatalogStatus)}>
            <SelectTrigger id="category-status" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {CATEGORY_STATUSES.map((status) => <SelectItem key={status} value={status}>{t(CATEGORY_STATUS_MESSAGE_KEYS[status])}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldDescription>{t("admin.commerce.categories.form.statusHelp")}</FieldDescription>
        </Field>
      </div>
    </FieldGroup>
  );
}
