"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OrderItem } from "@/lib/api/types";
import { useCreateReviewMutation } from "@/lib/queries/commerce";
import { cn } from "@/lib/utils";

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 5 * 1024 * 1024;

type OrderReviewDialogProps = {
  item: OrderItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderReviewDialog({ item, open, onOpenChange }: OrderReviewDialogProps) {
  const { t } = useI18n();
  const mutation = useCreateReviewMutation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imagePreviews = useMemo(
    () => images.map((image) => ({ image, url: URL.createObjectURL(image) })),
    [images],
  );

  useEffect(() => {
    return () => imagePreviews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const resetForm = () => {
    setRating(0);
    setComment("");
    setImages([]);
    setValidationError(null);
    mutation.reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;
    if (images.length + selected.length > 5) {
      setValidationError(t("reviews.write.imageCountError"));
      return;
    }
    const invalidType = selected.find((file) => !acceptedImageTypes.has(file.type));
    if (invalidType) {
      setValidationError(t("reviews.write.imageTypeError", { file: invalidType.name }));
      return;
    }
    const oversized = selected.find((file) => file.size > maxImageBytes);
    if (oversized) {
      setValidationError(t("reviews.write.imageSizeError", { file: oversized.name }));
      return;
    }
    setValidationError(null);
    setImages((current) => [...current, ...selected]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;
    if (rating < 1 || rating > 5) {
      setValidationError(t("reviews.write.ratingError"));
      return;
    }
    if (comment.length > 1_000) {
      setValidationError(t("reviews.write.commentError"));
      return;
    }
    setValidationError(null);
    try {
      await mutation.mutateAsync({
        orderItemId: item.id,
        rating,
        comment,
        images,
      });
      resetForm();
      onOpenChange(false);
    } catch {
      // Mutation state renders the error while keeping all customer input intact.
    }
  };

  const mutationError = mutation.error as {
    response?: { data?: { message?: string } };
    message?: string;
  } | null;
  const submitError =
    mutationError?.response?.data?.message ??
    mutationError?.message ??
    (mutation.isError ? t("reviews.write.submitError") : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-none bg-[#f8f5f0] p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-[#1c1a18]/10 bg-white px-6 py-6 pr-14">
          <DialogTitle className="font-serif text-2xl font-light">
            {t("reviews.write.title")}
          </DialogTitle>
          <DialogDescription>
            {item
              ? t("reviews.write.description", { product: item.productName })
              : t("reviews.write.descriptionFallback")}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-7 px-6 py-6" onSubmit={handleSubmit}>
          <fieldset>
            <legend className="text-xs font-bold tracking-[0.14em] text-[#1c1a18]/65 uppercase">
              {t("reviews.write.ratingLabel")}
            </legend>
            <div
              className="mt-3 flex gap-2"
              role="radiogroup"
              aria-label={t("reviews.write.ratingLabel")}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={t("reviews.write.ratingValue", { rating: value })}
                  onClick={() => setRating(value)}
                  className="rounded-sm p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b5573a]"
                >
                  <Star
                    className={cn(
                      "size-8 transition-colors",
                      value <= rating ? "fill-[#b5573a] text-[#b5573a]" : "text-[#1c1a18]/20",
                    )}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-xs font-bold tracking-[0.14em] text-[#1c1a18]/65 uppercase">
              {t("reviews.write.commentLabel")}
            </span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1_000}
              rows={6}
              placeholder={t("reviews.write.commentPlaceholder")}
              className="mt-3 w-full resize-y rounded-sm border border-[#1c1a18]/15 bg-white px-4 py-3 text-sm leading-6 transition-colors outline-none focus:border-[#b5573a]"
            />
            <span className="mt-1 block text-right text-xs text-[#1c1a18]/45 tabular-nums">
              {comment.length}/1.000
            </span>
          </label>

          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold tracking-[0.14em] text-[#1c1a18]/65 uppercase">
                {t("reviews.write.imagesLabel")}
              </span>
              <span className="text-xs text-[#1c1a18]/45">{images.length}/5</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#1c1a18]/50">
              {t("reviews.write.imagesHelp")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {imagePreviews.map(({ image, url }, index) => (
                <div
                  key={`${image.name}-${image.lastModified}-${index}`}
                  className="relative size-24 overflow-hidden rounded-sm border border-[#1c1a18]/10 bg-white"
                >
                  <Image
                    src={url}
                    alt={t("reviews.write.previewAlt", { index: index + 1 })}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((current) =>
                        current.filter((_, currentIndex) => currentIndex !== index),
                      )
                    }
                    className="absolute top-1 right-1 inline-flex size-7 items-center justify-center rounded-full bg-black/75 text-white focus-visible:outline-2 focus-visible:outline-offset-2"
                    aria-label={t("reviews.write.removeImage", { index: index + 1 })}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              {images.length < 5 ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex size-24 flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-[#1c1a18]/25 bg-white text-xs text-[#1c1a18]/60 hover:border-[#b5573a] hover:text-[#b5573a]"
                >
                  <ImagePlus className="size-5" />
                  {t("reviews.write.addImages")}
                </button>
              ) : null}
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleImages}
            />
          </div>

          {validationError || submitError ? (
            <div
              role="alert"
              className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {validationError ?? submitError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-[#1c1a18]/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => onOpenChange(false)}
              className="min-h-11 border border-[#1c1a18]/20 px-6 text-xs font-bold tracking-[0.14em] uppercase disabled:opacity-50"
            >
              {t("reviews.write.cancel")}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !item}
              className="min-h-11 bg-[#1c1a18] px-7 text-xs font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-[#b5573a] disabled:opacity-50"
            >
              {mutation.isPending ? t("reviews.write.submitting") : t("reviews.write.submit")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
