import { describe, expect, it } from "vitest";

import {
  createProductVariantWorkflowCheckpoint,
  recordPersistedVariant,
} from "@/app/(admin)/dashboard/products/_data/product-variant-workflow";
import type { ProductVariantFormValue } from "@/app/(admin)/dashboard/products/_components/product-variants-form";

function activeVariant(): ProductVariantFormValue {
  return {
    key: "new-1",
    sku: "LINEN-M",
    price: "500000",
    stockQuantity: "5",
    colorId: "1",
    sizeId: "2",
    status: "ACTIVE",
  };
}

describe("Product variant workflow checkpoint", () => {
  it("keeps desired ACTIVE immutable when staged INACTIVE persistence must retry", () => {
    const visibleFormVariants = [activeVariant()];
    let checkpoint = createProductVariantWorkflowCheckpoint({
      productId: 10,
      desiredVariants: visibleFormVariants,
      knownVariantIds: [],
      baselineVariants: [],
      needsActivationStage: true,
    });

    expect(checkpoint.desiredVariants[0].status).toBe("ACTIVE");
    expect(checkpoint.workingVariants[0].status).toBe("INACTIVE");
    expect(visibleFormVariants[0].status).toBe("ACTIVE");

    checkpoint = recordPersistedVariant(checkpoint, 0, {
      ...activeVariant(),
      key: "variant-41",
      id: 41,
      status: "INACTIVE",
    });

    // A core/status failure can now reuse this checkpoint without another create
    // and without losing the final ACTIVE intent.
    expect(checkpoint.persistedIds).toEqual([41]);
    expect(checkpoint.staleVariantIds).toEqual([]);
    expect(checkpoint.workingVariants[0]).toMatchObject({ id: 41, status: "INACTIVE" });
    expect(checkpoint.desiredVariants[0].status).toBe("ACTIVE");
    expect(visibleFormVariants[0].status).toBe("ACTIVE");
  });
});
