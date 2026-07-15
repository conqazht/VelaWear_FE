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
  SaleCampaignPhase,
} from "@/lib/api/admin-sales";
import type { AdminProductVariant } from "@/lib/api/admin-commerce";
import { useAdminProductVariantsQuery } from "@/lib/queries/admin-commerce";
import {
  useAdminSaleCampaignQuery,
  useCancelAdminSaleCampaignMutation,
  useCreateAdminSaleCampaignMutation,
  useDeleteAdminSaleCampaignMutation,
  useEndAdminSaleCampaignMutation,
  useEndAndCloneAdminSaleCampaignMutation,
  useIncreaseAdminSaleQuotaMutation,
  usePublishAdminSaleCampaignMutation,
  useUpdateAdminSaleCampaignMutation,
  useUpdateAdminSaleDisplayMutation,
} from "@/lib/queries/admin-sales";

import {
  createEmptySaleCampaignForm,
  getSaleCampaignPhase,
  saleCampaignToFormValues,
  toCreateSaleCampaignRequest,
  toLocalDateTimeInput,
  toUpdateSaleCampaignRequest,
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

const ACTION_COPY: Record<
  LifecycleAction,
  { title: string; description: string; label: string; destructive?: boolean }
> = {
  DELETE: {
    title: "Delete draft campaign?",
    description:
      "This permanently deletes the draft and its configured items. Published campaigns cannot be deleted.",
    label: "Delete draft",
    destructive: true,
  },
  CANCEL: {
    title: "Cancel upcoming campaign?",
    description:
      "The campaign will no longer start. Its history remains available in read-only mode.",
    label: "Cancel campaign",
    destructive: true,
  },
  END: {
    title: "End live campaign now?",
    description:
      "New checkouts will stop receiving this price. Existing valid reservations keep their payment window.",
    label: "End campaign",
    destructive: true,
  },
  END_AND_CLONE: {
    title: "End and create a new draft?",
    description:
      "The live campaign ends now and a draft copy is created for a future schedule. Current reservations remain valid.",
    label: "End & clone",
  },
};

function phaseVariant(phase: SaleCampaignPhase) {
  if (phase === "LIVE") return "default" as const;
  if (phase === "UPCOMING") return "secondary" as const;
  return "outline" as const;
}

function EditorLoading() {
  return (
    <Card>
      <CardContent className="flex min-h-80 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading sale campaign...
        </div>
      </CardContent>
    </Card>
  );
}

export function SaleCampaignEditor({ campaignId }: { campaignId?: number }) {
  const campaignQuery = useAdminSaleCampaignQuery(campaignId);
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
        title="Sale campaign was not found"
        description="The campaign identifier in this URL is invalid."
        variant="panel"
        accent="#f7f4ef"
        primaryAction={{ label: "Back to campaigns", href: "/dashboard/sales" }}
      />
    );
  }

  if (campaignId !== undefined && campaignQuery.isPending) {
    return <EditorLoading />;
  }

  if (campaignId !== undefined && campaignQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unable to load sale campaign</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert variant="destructive">
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>
              {getApiErrorMessage(campaignQuery.error)}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={() => void campaignQuery.refetch()}>
              <RefreshCw /> Try again
            </Button>
            <Button variant="outline" render={<Link href="/dashboard/sales" />}>
              Back to campaigns
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
      availableVariants={variantsQuery.data?.result ?? []}
      variantsLoading={variantsQuery.isPending}
      variantsError={
        variantsQuery.isError ? getApiErrorMessage(variantsQuery.error) : null
      }
      onRefresh={() => void campaignQuery.refetch()}
    />
  );
}

type SaleCampaignEditorFormProps = {
  campaign?: AdminSaleCampaign;
  availableVariants: AdminProductVariant[];
  variantsLoading: boolean;
  variantsError: string | null;
  onRefresh: () => void;
};

function SaleCampaignEditorForm({
  campaign,
  availableVariants,
  variantsLoading,
  variantsError,
  onRefresh,
}: SaleCampaignEditorFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState<SaleCampaignFormValues>(() =>
    campaign ? saleCampaignToFormValues(campaign) : createEmptySaleCampaignForm(),
  );
  const [lifecycleAction, setLifecycleAction] =
    useState<LifecycleAction | null>(null);
  const [cloneDraft, setCloneDraft] = useState<CloneDraftValues>(() => ({
    code: campaign ? `${campaign.code}_NEXT`.slice(0, 50) : "",
    name: campaign ? `${campaign.name} (next)` : "",
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
  const publishMutation = usePublishAdminSaleCampaignMutation();
  const deleteMutation = useDeleteAdminSaleCampaignMutation();
  const cancelMutation = useCancelAdminSaleCampaignMutation();
  const displayMutation = useUpdateAdminSaleDisplayMutation();
  const increaseQuotaMutation = useIncreaseAdminSaleQuotaMutation();
  const endMutation = useEndAdminSaleCampaignMutation();
  const endAndCloneMutation = useEndAndCloneAdminSaleCampaignMutation();

  const phase = campaign ? getSaleCampaignPhase(campaign) : null;
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
    publishMutation.isPending ||
    displayMutation.isPending;
  const isLifecyclePending =
    deleteMutation.isPending ||
    cancelMutation.isPending ||
    endMutation.isPending ||
    endAndCloneMutation.isPending;

  function goToStep(nextStep: 1 | 2 | 3) {
    if (nextStep > step && nextStep > 1) {
      const validation = validateSaleCampaignForm(values, {
        displayOnly: isLive,
      });
      if (!validation.valid && validation.step < nextStep) {
        setStep(validation.step);
        toast.error(validation.message);
        return;
      }
    }
    setStep(nextStep);
  }

  async function saveCampaign(publishAfterSave: boolean) {
    const validation = validateSaleCampaignForm(values, {
      displayOnly: isLive,
    });
    if (!validation.valid) {
      setStep(validation.step);
      toast.error(validation.message);
      return;
    }

    try {
      if (isLive && campaign) {
        const saved = await displayMutation.mutateAsync({
          id: campaign.id,
          request: {
            name: values.name.trim(),
            description: values.description.trim() || null,
            bannerUrl: values.bannerUrl.trim() || null,
            version: campaign.version,
          },
        });
        toast.success(`${saved.name} display details were updated.`);
        return;
      }

      const saved = campaign
        ? await updateMutation.mutateAsync({
            id: campaign.id,
            request: toUpdateSaleCampaignRequest(values, campaign.version),
          })
        : await createMutation.mutateAsync(toCreateSaleCampaignRequest(values));

      if (!publishAfterSave) {
        toast.success(
          campaign ? `${saved.name} was updated.` : `${saved.name} was saved as a draft.`,
        );
        if (!campaign) router.replace(`/dashboard/sales/${saved.id}`);
        return;
      }

      try {
        const published = await publishMutation.mutateAsync({
          id: saved.id,
          version: saved.version,
        });
        toast.success(`${published.name} was published.`);
        router.replace(`/dashboard/sales/${published.id}`);
      } catch (error) {
        toast.error(
          `Campaign changes were saved, but publishing failed. ${getApiErrorMessage(error)}`,
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
        toast.success(`${campaign.name} was deleted.`);
        router.replace("/dashboard/sales");
      } else if (lifecycleAction === "CANCEL") {
        const cancelled = await cancelMutation.mutateAsync({
          id: campaign.id,
          version: campaign.version,
        });
        toast.success(`${cancelled.name} was cancelled.`);
      } else if (lifecycleAction === "END") {
        const ended = await endMutation.mutateAsync({
          id: campaign.id,
          version: campaign.version,
        });
        toast.success(`${ended.name} ended.`);
      } else {
        const code = cloneDraft.code.trim().toUpperCase();
        const name = cloneDraft.name.trim();
        const startsAt = new Date(cloneDraft.startsAt);
        const endsAt = new Date(cloneDraft.endsAt);
        if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(code)) {
          toast.error("Clone code must contain 3–50 uppercase letters, numbers, dashes, or underscores.");
          return;
        }
        if (!name) {
          toast.error("Enter a name for the cloned campaign.");
          return;
        }
        if (
          Number.isNaN(startsAt.getTime()) ||
          Number.isNaN(endsAt.getTime()) ||
          endsAt <= startsAt
        ) {
          toast.error("Choose a valid future schedule for the cloned campaign.");
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
        toast.success("Campaign ended and a new draft was created.");
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
      toast.error("Quota increase must be a positive whole number.");
      return;
    }

    try {
      const updated = await increaseQuotaMutation.mutateAsync({
        campaignId: campaign.id,
        itemId: quotaItem.id,
        request: { additionalQuantity, version: campaign.version },
      });
      toast.success(
        `${quotaItem.sku} quota increased by ${additionalQuantity}.`,
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
            aria-label="Back to sale campaigns"
          >
            <ArrowLeft />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold">
                {campaign ? campaign.name : "Create sale campaign"}
              </h1>
              {campaign ? (
                <>
                  <Badge variant={campaign.status === "CANCELLED" ? "destructive" : "outline"}>
                    {campaign.status}
                  </Badge>
                  {phase ? <Badge variant={phaseVariant(phase)}>{phase}</Badge> : null}
                </>
              ) : null}
            </div>
            <p className="mt-1 max-w-2xl text-muted-foreground text-sm">
              {campaign
                ? "Manage the schedule, eligible variants, sale prices, and lifecycle from one workflow."
                : "Configure a scheduled Standard or quota-controlled Flash sale."}
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
              <Trash2 /> Delete draft
            </Button>
          ) : null}
          {isPublishedUpcoming ? (
            <Button
              variant="destructive"
              onClick={() => setLifecycleAction("CANCEL")}
              disabled={isSaving || isLifecyclePending}
            >
              <Ban /> Cancel campaign
            </Button>
          ) : null}
          {isLive ? (
            <>
              <Button
                variant="outline"
                onClick={() => setLifecycleAction("END_AND_CLONE")}
                disabled={isSaving || isLifecyclePending}
              >
                <CopyPlus /> End & clone
              </Button>
              <Button
                variant="destructive"
                onClick={() => setLifecycleAction("END")}
                disabled={isSaving || isLifecyclePending}
              >
                <Square /> End now
              </Button>
            </>
          ) : null}
        </div>
      </header>

      {isLive ? (
        <Alert>
          <LockKeyhole />
          <AlertTitle>Live-safe editing is active</AlertTitle>
          <AlertDescription>
            Name, description, and banner remain editable. Schedule, variants, and prices are locked; Flash quota can only increase.
          </AlertDescription>
        </Alert>
      ) : null}
      {isReadOnly ? (
        <Alert>
          <LockKeyhole />
          <AlertTitle>This campaign is read-only</AlertTitle>
          <AlertDescription>
            Ended and cancelled campaigns are retained for pricing and order history.
          </AlertDescription>
        </Alert>
      ) : null}

      <CampaignStepper currentStep={step} onStepChange={goToStep} />

      <Card>
        <CardHeader className="border-b">
          <CardTitle>
            {step === 1
              ? "Campaign details"
              : step === 2
                ? "Products, prices, and limits"
                : "Review campaign"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <CampaignDetailsStep
              values={values}
              onChange={setValues}
              codeDisabled={Boolean(campaign) || !canEditAll}
              displayDisabled={!canEditDisplay}
              typeAndScheduleDisabled={!canEditAll}
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
              <ArrowLeft /> Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(Math.min(3, step + 1) as 1 | 2 | 3)}
              disabled={step === 3 || isSaving}
            >
              Next <ArrowRight />
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
                  Save draft
                </Button>
              ) : null}
              {isPublishedUpcoming || isLive ? (
                <Button
                  onClick={() => void saveCampaign(false)}
                  disabled={isSaving || isLifecyclePending}
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                  {isLive ? "Save display" : "Save changes"}
                </Button>
              ) : null}
              {(!campaign || isDraft) && !isLive ? (
                <Button
                  onClick={() => void saveCampaign(true)}
                  disabled={isSaving || isLifecyclePending}
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Rocket />}
                  Save & publish
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
  return (
    <div className="grid gap-3 rounded-xl border p-4">
      <div>
        <h2 className="font-heading font-medium">Live quota controls</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Quota can only increase while a Flash campaign is live.
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
              <p>{item.quota ?? 0} quota</p>
              <p className="text-muted-foreground text-xs">
                {item.reservedQuantity} reserved · {item.soldQuantity} sold
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onIncrease(item)}
              disabled={disabled}
            >
              <Plus /> Increase
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
  const copy = action ? ACTION_COPY[action] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy?.title ?? "Confirm action"}</DialogTitle>
          <DialogDescription>{copy?.description}</DialogDescription>
        </DialogHeader>
        {action === "END_AND_CLONE" ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="clone-code" className="font-medium text-sm">New campaign code</label>
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
              <label htmlFor="clone-name" className="font-medium text-sm">New campaign name</label>
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
                <label htmlFor="clone-start" className="font-medium text-sm">Starts at</label>
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
                <label htmlFor="clone-end" className="font-medium text-sm">Ends at</label>
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
            Keep campaign
          </Button>
          <Button
            variant={copy?.destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? <Loader2 className="animate-spin" /> : null}
            {copy?.label ?? "Confirm"}
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
  const currentQuota = item?.quota ?? 0;
  const nextQuota = currentQuota + (Number(value) || 0);

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Increase Flash quota</DialogTitle>
          <DialogDescription>
            Increase quota for {item?.sku ?? "this variant"}. Existing quota cannot be reduced while live.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label htmlFor="additional-quota" className="font-medium text-sm">
            Additional quantity
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
            {currentQuota} current + {Number(value) || 0} = {nextQuota} new quota
          </p>
          {item ? (
            <p className="text-muted-foreground text-xs">
              Sale price {formatCurrency(item.promotionalPrice)} · {item.reservedQuantity} reserved · {item.soldQuantity} sold
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Plus />}
            Increase quota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
