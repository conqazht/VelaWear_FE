import type { ProductVariantFormValue } from "@/app/(admin)/dashboard/products/_components/product-variants-form";

export type ProductVariantWorkflowCheckpoint = {
  productId: number;
  needsActivationStage: boolean;
  desiredVariants: ReadonlyArray<Readonly<ProductVariantFormValue>>;
  workingVariants: ProductVariantFormValue[];
  persistedIds: number[];
  persistedBaselines: ProductVariantFormValue[];
  staleVariantIds: number[];
};

type CreateProductVariantWorkflowCheckpointOptions = {
  productId: number;
  desiredVariants: ProductVariantFormValue[];
  knownVariantIds: number[];
  baselineVariants: ProductVariantFormValue[];
  needsActivationStage: boolean;
};

function cloneVariant(variant: ProductVariantFormValue): ProductVariantFormValue {
  return { ...variant };
}

export function createProductVariantWorkflowCheckpoint({
  productId,
  desiredVariants,
  knownVariantIds,
  baselineVariants,
  needsActivationStage,
}: CreateProductVariantWorkflowCheckpointOptions): ProductVariantWorkflowCheckpoint {
  const desiredSnapshot = Object.freeze(
    desiredVariants.map((variant) => Object.freeze(cloneVariant(variant))),
  );
  const desiredPersistedIds = new Set(
    desiredVariants.flatMap((variant) =>
      variant.id === undefined ? [] : [variant.id],
    ),
  );

  return {
    productId,
    needsActivationStage,
    desiredVariants: desiredSnapshot,
    workingVariants: desiredVariants.map((variant) => ({
      ...cloneVariant(variant),
      status:
        needsActivationStage && variant.status === "ACTIVE"
          ? "INACTIVE"
          : variant.status,
    })),
    persistedIds: [...knownVariantIds],
    persistedBaselines: baselineVariants.map(cloneVariant),
    staleVariantIds: knownVariantIds.filter((id) => !desiredPersistedIds.has(id)),
  };
}

export function recordPersistedVariant(
  checkpoint: ProductVariantWorkflowCheckpoint,
  index: number,
  savedVariant: ProductVariantFormValue,
): ProductVariantWorkflowCheckpoint {
  const persistedIds = savedVariant.id === undefined
    ? checkpoint.persistedIds
    : [...new Set([...checkpoint.persistedIds, savedVariant.id])];
  const persistedBaselines = savedVariant.id === undefined
    ? checkpoint.persistedBaselines
    : [
        ...checkpoint.persistedBaselines.filter(
          (variant) => variant.id !== savedVariant.id,
        ),
        cloneVariant(savedVariant),
      ];

  return {
    ...checkpoint,
    workingVariants: checkpoint.workingVariants.map((variant, itemIndex) =>
      itemIndex === index ? cloneVariant(savedVariant) : variant,
    ),
    persistedIds,
    persistedBaselines,
  };
}

export function recordDeletedVariant(
  checkpoint: ProductVariantWorkflowCheckpoint,
  variantId: number,
): ProductVariantWorkflowCheckpoint {
  return {
    ...checkpoint,
    persistedIds: checkpoint.persistedIds.filter((id) => id !== variantId),
    persistedBaselines: checkpoint.persistedBaselines.filter(
      (variant) => variant.id !== variantId,
    ),
    staleVariantIds: checkpoint.staleVariantIds.filter((id) => id !== variantId),
  };
}
