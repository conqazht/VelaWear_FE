"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  CopyPlus,
  Loader2,
  LockKeyhole,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Square,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  formatCurrency,
  getApiErrorMessage,
} from "@/app/(admin)/dashboard/_components/management/resource-utils";
import { AnimatedStatus } from "@/components/errors/animated-status";
import { useI18n } from "@/components/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type {
  AdminSaleCampaign,
  AdminSaleCampaignItem,
  SaleCampaignTranslation,
  SaleCampaignPhase,
} from "@/lib/api/admin-sales";
import type { AdminProductVariant } from "@/lib/api/admin-commerce";
import type { GeminiContentModel } from "@/lib/api/admin-translation-suggestions";
import { useAdminProductVariantsQuery } from "@/lib/queries/admin-commerce";
import { useSaleCampaignEnglishSuggestionMutation } from "@/lib/queries/admin-translation-suggestions";
import {
  useAdminSaleCampaignQuery,
  useAdminSaleCampaignTranslationsQuery,
  useCancelAdminSaleCampaignMutation,
  useCreateAdminSaleCampaignMutation,
  useDeleteAdminSaleCampaignMutation,
  useEndAdminSaleCampaignMutation,
  useEndAndCloneAdminSaleCampaignMutation,
  useIncreaseAdminSaleQuotaMutation,
  usePublishAdminSaleCampaignMutation,
  useUpdateAdminSaleCampaignMutation,
  useUpdateAdminSaleCampaignTranslationsMutation,
  useDeleteAdminSaleCampaignTranslationMutation,
  useUpdateAdminSaleDisplayMutation,
} from "@/lib/queries/admin-sales";

import {
  createEmptySaleCampaignForm,
  getSaleCampaignPhase,
  saveSaleCampaignWithTranslations,
  saleCampaignToFormValues,
  serializeSaleCampaignTranslations,
  toLocalDateTimeInput,
  validateSaleCampaignForm,
  type SaleCampaignFormValues,
} from "../_data/sale-campaign-form";
import { CampaignDetailsStep } from "./campaign-details-step";
import { CampaignReviewStep } from "./campaign-review-step";
import { CampaignStepper } from "./campaign-stepper";
import { ProductVariantPicker } from "./product-variant-picker";

type LifecycleAction = "DELETE" | "CANCEL" | "END" | "END_AND_CLONE";

type CloneDraftValues = {
  code: string;
  name: string;
  startsAt: string;
  endsAt: string;
};

function phaseVariant(phase: SaleCampaignPhase) {
  if (phase === "LIVE") return "default" as const;
  if (phase === "UPCOMING") return "secondary" as const;
  return "outline" as const;
}

function EditorLoading() {
  const { t } = useI18n();

  return (
    <Card>
      <CardContent className="flex min-h-80 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {t("admin.sales.editor.loading")}
        </div>
      </CardContent>
    </Card>
  );
}

export function SaleCampaignEditor({ campaignId }: { campaignId?: number }) {
  const { t } = useI18n();
  const campaignQuery = useAdminSaleCampaignQuery(campaignId);
  const translationsQuery = useAdminSaleCampaignTranslationsQuery(campaignId);
  const variantsQuery = useAdminProductVariantsQuery({
    page: 1,
    size: 2_000,
    sort: "id,asc",
    status: "ACTIVE",
  });

  if (
    campaignId !== undefined &&
    (!Number.isInteger(campaignId) || campaignId <= 0)
  ) {
    return (
      <AnimatedStatus
        code="404"
        title={t("admin.sales.editor.notFound.title")}
        description={t("admin.sales.editor.notFound.description")}
        variant="panel"
        accent="#f7f4ef"
        primaryAction={{
          label: t("admin.sales.editor.backToCampaigns"),
          href: "/dashboard/sales",
        }}
      />
    );
  }

  if (campaignId !== undefined && (campaignQuery.isPending || translationsQuery.isPending)) {
    return <EditorLoading />;
  }

  if (campaignId !== undefined && (campaignQuery.isError || translationsQuery.isError)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.sales.editor.loadError.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert variant="destructive">
            <AlertTitle>{t("admin.sales.editor.loadError.requestFailed")}</AlertTitle>
            <AlertDescription>
              {getApiErrorMessage(campaignQuery.error ?? translationsQuery.error)}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={() => void Promise.all([campaignQuery.refetch(), translationsQuery.refetch()])}>
              <RefreshCw /> {t("admin.sales.editor.tryAgain")}
            </Button>
            <Button variant="outline" render={<Link href="/dashboard/sales" />}>
              {t("admin.sales.editor.backToCampaigns")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const campaign = campaignQuery.data;
  const formKey = campaign
    ? `${campaign.id}-${campaign.version}-${campaign.updatedAt}`
    : "new-campaign";

  return (
    <SaleCampaignEditorForm
      key={formKey}
      campaign={campaign}
      translations={translationsQuery.data?.translations ?? []}
      availableVariants={variantsQuery.data?.result ?? []}
      variantsLoading={variantsQuery.isPending}
      variantsError={
        variantsQuery.isError ? getApiErrorMessage(variantsQuery.error) : null
      }
      onRefresh={() => void Promise.all([campaignQuery.refetch(), translationsQuery.refetch()])}
    />
  );
}

type SaleCampaignEditorFormProps = {
  campaign?: AdminSaleCampaign;
  translations: SaleCampaignTranslation[];
  availableVariants: AdminProductVariant[];
  variantsLoading: boolean;
  variantsError: string | null;
  onRefresh: () => void;
};

function SaleCampaignEditorForm({
  campaign,
  translations,
  availableVariants,
  variantsLoading,
  variantsError,
  onRefresh,
}: SaleCampaignEditorFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState<SaleCampaignFormValues>(() =>
    campaign ? saleCampaignToFormValues(campaign, translations) : createEmptySaleCampaignForm(),
  );
  const [persistedCampaign, setPersistedCampaign] = useState<AdminSaleCampaign | null>(null);
  const [contentLocale, setContentLocale] = useState<"vi" | "en">("vi");
  const [lifecycleAction, setLifecycleAction] =
    useState<LifecycleAction | null>(null);
  const [cloneDraft, setCloneDraft] = useState<CloneDraftValues>(() => ({
    code: campaign ? `${campaign.code}_NEXT`.slice(0, 50) : "",
    name: campaign
      ? t("admin.sales.editor.clone.defaultName", { name: campaign.name })
      : "",
    startsAt: campaign ? toLocalDateTimeInput(campaign.endsAt) : "",
    endsAt: campaign
      ? toLocalDateTimeInput(
          new Date(
            new Date(campaign.endsAt).getTime() +
              (new Date(campaign.endsAt).getTime() -
                new Date(campaign.startsAt).getTime()),
          ),
        )
      : "",
  }));
  const [quotaItem, setQuotaItem] = useState<AdminSaleCampaignItem | null>(null);
  const [additionalQuota, setAdditionalQuota] = useState("1");

  const createMutation = useCreateAdminSaleCampaignMutation();
  const updateMutation = useUpdateAdminSaleCampaignMutation();
  const translationMutation = useUpdateAdminSaleCampaignTranslationsMutation();
  const deleteTranslationMutation = useDeleteAdminSaleCampaignTranslationMutation();
  const publishMutation = usePublishAdminSaleCampaignMutation();
  const deleteMutation = useDeleteAdminSaleCampaignMutation();
  const cancelMutation = useCancelAdminSaleCampaignMutation();
  const displayMutation = useUpdateAdminSaleDisplayMutation();
  const increaseQuotaMutation = useIncreaseAdminSaleQuotaMutation();
  const endMutation = useEndAdminSaleCampaignMutation();
  const endAndCloneMutation = useEndAndCloneAdminSaleCampaignMutation();
  const englishSuggestionMutation = useSaleCampaignEnglishSuggestionMutation();

  const phase = campaign ? getSaleCampaignPhase(campaign) : null;
  const statusLabel = campaign
    ? campaign.status === "DRAFT"
      ? t("admin.sales.management.status.draft")
      : campaign.status === "PUBLISHED"
        ? t("admin.sales.management.status.published")
        : t("admin.sales.management.status.cancelled")
    : null;
  const phaseLabel = phase
    ? phase === "UPCOMING"
      ? t("admin.sales.management.phase.upcoming")
      : phase === "LIVE"
        ? t("admin.sales.management.phase.live")
        : t("admin.sales.management.phase.ended")
    : null;
  const isDraft = campaign?.status === "DRAFT";
  const isPublishedUpcoming =
    campaign?.status === "PUBLISHED" && phase === "UPCOMING";
  const isLive = campaign?.status === "PUBLISHED" && phase === "LIVE";
  const isReadOnly =
    campaign?.status === "CANCELLED" ||
    (campaign?.status === "PUBLISHED" && phase === "ENDED");
  const canEditAll = !campaign || isDraft || isPublishedUpcoming;
  const canEditDisplay = canEditAll || isLive;
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    translationMutation.isPending ||
    deleteTranslationMutation.isPending ||
    publishMutation.isPending ||
    displayMutation.isPending ||
    englishSuggestionMutation.isPending;
  const isLifecyclePending =
    deleteMutation.isPending ||
    cancelMutation.isPending ||
    endMutation.isPending ||
    endAndCloneMutation.isPending;

  function goToStep(nextStep: 1 | 2 | 3) {
    if (nextStep > step && nextStep > 1) {
      const validation = validateSaleCampaignForm(values, {
        displayOnly: isLive,
        t,
      });
      if (!validation.valid && validation.step < nextStep) {
        setStep(validation.step);
        if (validation.step === 1) {
          setContentLocale(values.englishDescription.trim() && !values.englishName.trim() ? "en" : "vi");
        }
        toast.error(validation.message);
        return;
      }
    }
    setStep(nextStep);
  }

  async function generateEnglishContent(model: GeminiContentModel) {
    try {
      const suggestion = await englishSuggestionMutation.mutateAsync({
        model,
        name: values.name.trim(),
        description: values.description.trim() || null,
      });
      const name = suggestion.name.trim();
      if (suggestion.localeCode !== "en" || !name) {
        toast.error(t("admin.contentGeneration.invalidResponse"));
        return;
      }

      setValues((current) => ({
        ...current,
        englishName: name,
        englishDescription: suggestion.description ?? "",
      }));
      setContentLocale("en");
      toast.success(t("admin.contentGeneration.success"));
    } catch (error) {
      toast.error(
        `${t("admin.contentGeneration.failed")} ${getApiErrorMessage(error)}`,
      );
    }
  }

  async function saveTranslations(saved: AdminSaleCampaign) {
    const requestedTranslations = serializeSaleCampaignTranslations(values);

    const updated = await translationMutation.mutateAsync({
      id: saved.id,
      request: { version: saved.version, translations: requestedTranslations },
    });
    let version = updated.version;
    let savedTranslations = updated.translations;
    if (
      !values.englishName.trim() &&
      savedTranslations.some((translation) => translation.localeCode === "en")
    ) {
      const deleted = await deleteTranslationMutation.mutateAsync({
        id: saved.id,
        locale: "en",
        version,
      });
      version = deleted.version;
      savedTranslations = deleted.translations;
    }
    return {
      ...saved,
      version,
      translationLocales: savedTranslations.map((translation) => translation.localeCode),
    };
  }

  async function saveCampaign(publishAfterSave: boolean) {
    const validation = validateSaleCampaignForm(values, {
      displayOnly: isLive,
      t,
    });
    if (!validation.valid) {
      setStep(validation.step);
      if (validation.step === 1) {
        setContentLocale(values.englishDescription.trim() && !values.englishName.trim() ? "en" : "vi");
      }
      toast.error(validation.message);
      return;
    }

    try {
      const campaignForSave = persistedCampaign ?? campaign;
      if (isLive && campaignForSave) {
        const displaySaved = await displayMutation.mutateAsync({
          id: campaignForSave.id,
          request: {
            name: values.name.trim(),
            description: values.description.trim() || null,
            bannerUrl: values.bannerUrl.trim() || null,
            version: campaignForSave.version,
          },
        });
        setPersistedCampaign(displaySaved);
        const saved = await saveTranslations(displaySaved);
        setPersistedCampaign(saved);
        toast.success(t("admin.sales.editor.toast.displayUpdated", { name: saved.name }));
        return;
      }

      const saved = await saveSaleCampaignWithTranslations({
        campaign: campaignForSave,
        values,
        createCampaign: (request) => createMutation.mutateAsync(request),
        updateCampaign: (input) => updateMutation.mutateAsync(input),
        saveTranslations,
        onBasePersisted: setPersistedCampaign,
      });

      if (!publishAfterSave) {
        toast.success(
          campaign
            ? t("admin.sales.editor.toast.updated", { name: saved.name })
            : t("admin.sales.editor.toast.draftSaved", { name: saved.name }),
        );
        if (!campaign) router.replace(`/dashboard/sales/${saved.id}`);
        return;
      }

      try {
        const published = await publishMutation.mutateAsync({
          id: saved.id,
          version: saved.version,
        });
        toast.success(
          t("admin.sales.editor.toast.published", { name: published.name }),
        );
        router.replace(`/dashboard/sales/${published.id}`);
      } catch (error) {
        toast.error(
          t("admin.sales.editor.toast.publishFailed", {
            error: getApiErrorMessage(error),
          }),
        );
        router.replace(`/dashboard/sales/${saved.id}`);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      onRefresh();
    }
  }

  async function performLifecycleAction() {
    if (!campaign || !lifecycleAction) return;

    try {
      if (lifecycleAction === "DELETE") {
        await deleteMutation.mutateAsync(campaign.id);
        toast.success(
          t("admin.sales.editor.toast.deleted", { name: campaign.name }),
        );
        router.replace("/dashboard/sales");
      } else if (lifecycleAction === "CANCEL") {
        const cancelled = await cancelMutation.mutateAsync({
          id: campaign.id,
          version: campaign.version,
        });
        toast.success(
          t("admin.sales.editor.toast.cancelled", { name: cancelled.name }),
        );
      } else if (lifecycleAction === "END") {
        const ended = await endMutation.mutateAsync({
          id: campaign.id,
          version: campaign.version,
        });
        toast.success(
          t("admin.sales.editor.toast.ended", { name: ended.name }),
        );
      } else {
        const code = cloneDraft.code.trim().toUpperCase();
        const name = cloneDraft.name.trim();
        const startsAt = new Date(cloneDraft.startsAt);
        const endsAt = new Date(cloneDraft.endsAt);
        if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(code)) {
          toast.error(t("admin.sales.editor.validation.cloneCode"));
          return;
        }
        if (!name) {
          toast.error(t("admin.sales.editor.validation.cloneName"));
          return;
        }
        if (
          Number.isNaN(startsAt.getTime()) ||
          Number.isNaN(endsAt.getTime()) ||
          endsAt <= startsAt
        ) {
          toast.error(t("admin.sales.editor.validation.cloneSchedule"));
          return;
        }
        const clone = await endAndCloneMutation.mutateAsync({
          id: campaign.id,
          request: {
            version: campaign.version,
            code,
            name,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
          },
        });
        toast.success(t("admin.sales.editor.toast.cloned"));
        router.replace(`/dashboard/sales/${clone.id}`);
      }
      setLifecycleAction(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setLifecycleAction(null);
      onRefresh();
    }
  }

  async function increaseQuota() {
    if (!campaign || !quotaItem) return;
    const additionalQuantity = Number(additionalQuota);
    if (!Number.isInteger(additionalQuantity) || additionalQuantity <= 0) {
      toast.error(t("admin.sales.editor.validation.quotaIncrease"));
      return;
    }

    try {
      const updated = await increaseQuotaMutation.mutateAsync({
        campaignId: campaign.id,
        itemId: quotaItem.id,
        request: { additionalQuantity, version: campaign.version },
      });
      toast.success(
        t("admin.sales.editor.toast.quotaIncreased", {
          sku: quotaItem.sku,
          count: additionalQuantity,
        }),
      );
      setQuotaItem(null);
      setAdditionalQuota("1");
      router.replace(`/dashboard/sales/${updated.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setQuotaItem(null);
      onRefresh();
    }
  }

  return (
    <div className="grid gap-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            render={<Link href="/dashboard/sales" />}
            aria-label={t("admin.sales.editor.backAria")}
          >
            <ArrowLeft />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold">
                {campaign ? campaign.name : t("admin.sales.editor.createTitle")}
              </h1>
              {campaign ? (
                <>
                  <Badge variant={campaign.status === "CANCELLED" ? "destructive" : "outline"}>
                    {statusLabel}
                  </Badge>
                  {phase ? (
                    <Badge variant={phaseVariant(phase)}>{phaseLabel}</Badge>
                  ) : null}
                </>
              ) : null}
            </div>
            <p className="mt-1 max-w-2xl text-muted-foreground text-sm">
              {campaign
                ? t("admin.sales.editor.editDescription")
                : t("admin.sales.editor.createDescription")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isDraft ? (
            <Button
              variant="outline"
              onClick={() => setLifecycleAction("DELETE")}
              disabled={isSaving || isLifecyclePending}
            >
              <Trash2 /> {t("admin.sales.editor.action.deleteDraft")}
            </Button>
          ) : null}
          {isPublishedUpcoming ? (
            <Button
              variant="destructive"
              onClick={() => setLifecycleAction("CANCEL")}
              disabled={isSaving || isLifecyclePending}
            >
              <Ban /> {t("admin.sales.editor.action.cancelCampaign")}
            </Button>
          ) : null}
          {isLive ? (
            <>
              <Button
                variant="outline"
                onClick={() => setLifecycleAction("END_AND_CLONE")}
                disabled={isSaving || isLifecyclePending}
              >
                <CopyPlus /> {t("admin.sales.editor.action.endAndClone")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setLifecycleAction("END")}
                disabled={isSaving || isLifecyclePending}
              >
                <Square /> {t("admin.sales.editor.action.endNow")}
              </Button>
            </>
          ) : null}
        </div>
      </header>

      {isLive ? (
        <Alert>
          <LockKeyhole />
          <AlertTitle>{t("admin.sales.editor.liveAlert.title")}</AlertTitle>
          <AlertDescription>
            {t("admin.sales.editor.liveAlert.description")}
          </AlertDescription>
        </Alert>
      ) : null}
      {isReadOnly ? (
        <Alert>
          <LockKeyhole />
          <AlertTitle>{t("admin.sales.editor.readOnlyAlert.title")}</AlertTitle>
          <AlertDescription>
            {t("admin.sales.editor.readOnlyAlert.description")}
          </AlertDescription>
        </Alert>
      ) : null}

      <CampaignStepper
        currentStep={step}
        onStepChange={goToStep}
        disabled={englishSuggestionMutation.isPending}
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle>
            {step === 1
              ? t("admin.sales.editor.section.details")
              : step === 2
                ? t("admin.sales.editor.section.products")
                : t("admin.sales.editor.section.review")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <CampaignDetailsStep
              values={values}
              onChange={setValues}
              codeDisabled={Boolean(campaign || persistedCampaign) || !canEditAll}
              displayDisabled={!canEditDisplay}
              typeAndScheduleDisabled={!canEditAll}
              contentLocale={contentLocale}
              onContentLocaleChange={setContentLocale}
              isGeneratingEnglish={englishSuggestionMutation.isPending}
              interactionDisabled={englishSuggestionMutation.isPending}
              onGenerateEnglish={generateEnglishContent}
            />
          ) : step === 2 ? (
            <div className="grid gap-6">
              <ProductVariantPicker
                type={values.type}
                availableVariants={availableVariants}
                items={values.items}
                onChange={(items) => setValues((current) => ({ ...current, items }))}
                disabled={!canEditAll}
                isLoading={variantsLoading}
                error={variantsError}
              />
              {isLive && campaign.type === "FLASH" ? (
                <LiveQuotaManager
                  items={campaign.items}
                  onIncrease={(item) => {
                    setAdditionalQuota("1");
                    setQuotaItem(item);
                  }}
                  disabled={increaseQuotaMutation.isPending}
                />
              ) : null}
            </div>
          ) : (
            <CampaignReviewStep values={values} />
          )}
        </CardContent>
      </Card>

      <footer className="sticky bottom-0 z-10 -mx-4 border-t bg-background/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((current) => Math.max(1, current - 1) as 1 | 2 | 3)}
              disabled={step === 1 || isSaving}
            >
              <ArrowLeft /> {t("admin.sales.editor.navigation.previous")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(Math.min(3, step + 1) as 1 | 2 | 3)}
              disabled={step === 3 || isSaving}
            >
              {t("admin.sales.editor.navigation.next")} <ArrowRight />
            </Button>
          </div>

          {!isReadOnly ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              {(!campaign || isDraft) && !isLive ? (
                <Button
                  variant="outline"
                  onClick={() => void saveCampaign(false)}
                  disabled={isSaving || isLifecyclePending}
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                  {t("admin.sales.editor.saveDraft")}
                </Button>
              ) : null}
              {isPublishedUpcoming || isLive ? (
                <Button
                  onClick={() => void saveCampaign(false)}
                  disabled={isSaving || isLifecyclePending}
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                  {isLive
                    ? t("admin.sales.editor.saveDisplay")
                    : t("admin.sales.editor.saveChanges")}
                </Button>
              ) : null}
              {(!campaign || isDraft) && !isLive ? (
                <Button
                  onClick={() => void saveCampaign(true)}
                  disabled={isSaving || isLifecyclePending}
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Rocket />}
                  {t("admin.sales.editor.saveAndPublish")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </footer>

      <LifecycleDialog
        action={lifecycleAction}
        open={lifecycleAction !== null}
        pending={isLifecyclePending}
        onOpenChange={(open) => {
          if (!open && !isLifecyclePending) setLifecycleAction(null);
        }}
        onConfirm={() => void performLifecycleAction()}
        cloneDraft={cloneDraft}
        onCloneDraftChange={setCloneDraft}
      />

      <QuotaIncreaseDialog
        item={quotaItem}
        value={additionalQuota}
        onValueChange={setAdditionalQuota}
        pending={increaseQuotaMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !increaseQuotaMutation.isPending) setQuotaItem(null);
        }}
        onConfirm={() => void increaseQuota()}
      />
    </div>
  );
}

function LiveQuotaManager({
  items,
  onIncrease,
  disabled,
}: {
  items: AdminSaleCampaignItem[];
  onIncrease: (item: AdminSaleCampaignItem) => void;
  disabled: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="grid gap-3 rounded-xl border p-4">
      <div>
        <h2 className="font-heading font-medium">
          {t("admin.sales.editor.liveQuota.title")}
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          {t("admin.sales.editor.liveQuota.description")}
        </p>
      </div>
      <Separator />
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.productName}</p>
              <p className="font-mono text-muted-foreground text-xs">{item.sku}</p>
            </div>
            <div className="text-sm tabular-nums sm:text-right">
              <p>
                {t("admin.sales.editor.liveQuota.quota", {
                  count: item.quota ?? 0,
                })}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("admin.sales.editor.liveQuota.breakdown", {
                  reserved: item.reservedQuantity,
                  sold: item.soldQuantity,
                })}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onIncrease(item)}
              disabled={disabled}
            >
              <Plus /> {t("admin.sales.editor.liveQuota.increase")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LifecycleDialog({
  action,
  open,
  pending,
  onOpenChange,
  onConfirm,
  cloneDraft,
  onCloneDraftChange,
}: {
  action: LifecycleAction | null;
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  cloneDraft: CloneDraftValues;
  onCloneDraftChange: (values: CloneDraftValues) => void;
}) {
  const { t } = useI18n();
  const actionCopies = {
    DELETE: {
      title: t("admin.sales.editor.lifecycle.delete.title"),
      description: t("admin.sales.editor.lifecycle.delete.description"),
      label: t("admin.sales.editor.lifecycle.delete.confirm"),
      destructive: true,
    },
    CANCEL: {
      title: t("admin.sales.editor.lifecycle.cancel.title"),
      description: t("admin.sales.editor.lifecycle.cancel.description"),
      label: t("admin.sales.editor.lifecycle.cancel.confirm"),
      destructive: true,
    },
    END: {
      title: t("admin.sales.editor.lifecycle.end.title"),
      description: t("admin.sales.editor.lifecycle.end.description"),
      label: t("admin.sales.editor.lifecycle.end.confirm"),
      destructive: true,
    },
    END_AND_CLONE: {
      title: t("admin.sales.editor.lifecycle.clone.title"),
      description: t("admin.sales.editor.lifecycle.clone.description"),
      label: t("admin.sales.editor.lifecycle.clone.confirm"),
      destructive: false,
    },
  } satisfies Record<
    LifecycleAction,
    { title: string; description: string; label: string; destructive: boolean }
  >;
  const copy = action ? actionCopies[action] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {copy?.title ?? t("admin.sales.editor.lifecycle.confirmTitle")}
          </DialogTitle>
          <DialogDescription>{copy?.description}</DialogDescription>
        </DialogHeader>
        {action === "END_AND_CLONE" ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="clone-code" className="font-medium text-sm">
                {t("admin.sales.editor.clone.code")}
              </label>
              <Input
                id="clone-code"
                value={cloneDraft.code}
                onChange={(event) =>
                  onCloneDraftChange({
                    ...cloneDraft,
                    code: event.target.value.toUpperCase(),
                  })
                }
                maxLength={50}
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="clone-name" className="font-medium text-sm">
                {t("admin.sales.editor.clone.name")}
              </label>
              <Input
                id="clone-name"
                value={cloneDraft.name}
                onChange={(event) =>
                  onCloneDraftChange({ ...cloneDraft, name: event.target.value })
                }
                maxLength={150}
                disabled={pending}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="clone-start" className="font-medium text-sm">
                  {t("admin.sales.editor.clone.startsAt")}
                </label>
                <Input
                  id="clone-start"
                  type="datetime-local"
                  value={cloneDraft.startsAt}
                  onChange={(event) =>
                    onCloneDraftChange({ ...cloneDraft, startsAt: event.target.value })
                  }
                  disabled={pending}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="clone-end" className="font-medium text-sm">
                  {t("admin.sales.editor.clone.endsAt")}
                </label>
                <Input
                  id="clone-end"
                  type="datetime-local"
                  value={cloneDraft.endsAt}
                  onChange={(event) =>
                    onCloneDraftChange({ ...cloneDraft, endsAt: event.target.value })
                  }
                  disabled={pending}
                />
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {t("admin.sales.editor.lifecycle.keepCampaign")}
          </Button>
          <Button
            variant={copy?.destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? <Loader2 className="animate-spin" /> : null}
            {copy?.label ?? t("admin.sales.editor.lifecycle.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuotaIncreaseDialog({
  item,
  value,
  onValueChange,
  pending,
  onOpenChange,
  onConfirm,
}: {
  item: AdminSaleCampaignItem | null;
  value: string;
  onValueChange: (value: string) => void;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { locale, t } = useI18n();
  const currentQuota = item?.quota ?? 0;
  const nextQuota = currentQuota + (Number(value) || 0);

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.sales.editor.quotaDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("admin.sales.editor.quotaDialog.description", {
              sku: item?.sku ?? t("admin.sales.editor.quotaDialog.thisVariant"),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label htmlFor="additional-quota" className="font-medium text-sm">
            {t("admin.sales.editor.quotaDialog.additionalQuantity")}
          </label>
          <Input
            id="additional-quota"
            type="number"
            min="1"
            step="1"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            disabled={pending}
          />
          <p className="text-muted-foreground text-sm tabular-nums">
            {t("admin.sales.editor.quotaDialog.calculation", {
              current: currentQuota,
              additional: Number(value) || 0,
              next: nextQuota,
            })}
          </p>
          {item ? (
            <p className="text-muted-foreground text-xs">
              {t("admin.sales.editor.quotaDialog.details", {
                price: formatCurrency(item.promotionalPrice, locale),
                reserved: item.reservedQuantity,
                sold: item.soldQuantity,
              })}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {t("admin.sales.editor.quotaDialog.cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Plus />}
            {t("admin.sales.editor.quotaDialog.increase")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
