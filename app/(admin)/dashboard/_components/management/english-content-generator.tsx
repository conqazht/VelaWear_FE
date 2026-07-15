"use client";

import { useId, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_GEMINI_CONTENT_MODEL,
  GEMINI_CONTENT_MODELS,
  isGeminiContentModel,
  type GeminiContentModel,
} from "@/lib/api/admin-translation-suggestions";

const MODEL_LABEL_KEYS = {
  "gemini-3.1-flash-lite": "admin.contentGeneration.model.flashLite.label",
  "gemini-3.5-flash": "admin.contentGeneration.model.flash.label",
  "gemini-3.1-pro-preview": "admin.contentGeneration.model.proPreview.label",
} as const;

const MODEL_DESCRIPTION_KEYS = {
  "gemini-3.1-flash-lite": "admin.contentGeneration.model.flashLite.description",
  "gemini-3.5-flash": "admin.contentGeneration.model.flash.description",
  "gemini-3.1-pro-preview": "admin.contentGeneration.model.proPreview.description",
} as const;

type EnglishContentGeneratorProps = {
  hasEnglishContent: boolean;
  sourceReady: boolean;
  isPending: boolean;
  disabled?: boolean;
  onGenerate: (model: GeminiContentModel) => void | Promise<void>;
};

export function EnglishContentGenerator({
  hasEnglishContent,
  sourceReady,
  isPending,
  disabled = false,
  onGenerate,
}: EnglishContentGeneratorProps) {
  const { t } = useI18n();
  const [model, setModel] = useState<GeminiContentModel>(
    DEFAULT_GEMINI_CONTENT_MODEL,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const modelSelectId = useId();
  const actionDisabled = disabled || isPending || !sourceReady;

  function requestGeneration() {
    if (actionDisabled) return;
    if (hasEnglishContent) {
      setConfirmOpen(true);
      return;
    }
    void onGenerate(model);
  }

  function confirmGeneration() {
    setConfirmOpen(false);
    void onGenerate(model);
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid min-w-0 flex-1 gap-1.5">
          <FieldLabel htmlFor={modelSelectId}>
            {t("admin.contentGeneration.model.label")}
          </FieldLabel>
          <Select
            value={model}
            onValueChange={(value) => {
              if (value && isGeminiContentModel(value)) setModel(value);
            }}
            disabled={disabled || isPending}
          >
            <SelectTrigger id={modelSelectId} className="w-full sm:max-w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {GEMINI_CONTENT_MODELS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(MODEL_LABEL_KEYS[option])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={actionDisabled}
          onClick={requestGeneration}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {isPending
            ? t("admin.contentGeneration.action.pending")
            : t("admin.contentGeneration.action.generate")}
        </Button>
      </div>

      <FieldDescription>{t(MODEL_DESCRIPTION_KEYS[model])}</FieldDescription>
      {model === "gemini-3.1-pro-preview" ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {t("admin.contentGeneration.model.previewWarning")}
        </p>
      ) : null}
      {!sourceReady ? (
        <p className="text-xs text-muted-foreground">
          {t("admin.contentGeneration.sourceRequired")}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("admin.contentGeneration.reviewNotice")}
        </p>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.contentGeneration.confirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.contentGeneration.confirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">
              {t("admin.contentGeneration.confirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction type="button" onClick={confirmGeneration}>
              {t("admin.contentGeneration.confirm.action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
