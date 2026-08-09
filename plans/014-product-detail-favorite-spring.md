# 014 — Add spring pop feedback to product detail wishlist heart

- **Status**: DONE
- **Commit**: 937306c
- **Severity**: MEDIUM
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`components/shop/product-detail-client.tsx`)

## Problem

The wishlist heart button on the product detail page currently uses a simple `active:scale-95` CSS transition without a spring-popped favorite confirmation motion when toggling state.

```tsx
/* components/shop/product-detail-client.tsx:386 — current */
<Heart className={cn("size-4 transition-transform active:scale-95 duration-200", favorited && "fill-black stroke-black")} />
```

## Target

Wrap the `<Heart>` icon in a `motion.div` component that triggers a subtle spring pop when `favorited` becomes true, providing tactile feedback when adding a item to favorites:

```tsx
/* target */
<motion.div
  key={favorited ? "favorited" : "unfavorited"}
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 400, damping: 18 }}
>
  <Heart className={cn("size-4", favorited && "fill-black stroke-black")} />
</motion.div>
```

## Repo conventions to follow

- Existing interactive components use `motion/react` (`import { motion } from "motion/react"`).
- Spring configuration follows Apple-style crisp feedback (`stiffness: 400, damping: 18`).

## Steps

1. Inspect `product-detail-client.tsx` around line 386.
2. Wrap `<Heart>` icon in `motion.div` with key bound to `favorited` state and spring transition.
3. Respect `useReducedMotion()` fallback so reduced motion users receive opacity feedback without scale pop.

## Boundaries

- Do NOT change button click handler or favorite toggle logic.
- Do NOT alter Heart icon size or color styling.
- Do NOT add external dependencies.

## Verification

- **Mechanical**: `pnpm exec tsc --noEmit` exits with code 0; `pnpm lint` passes with 0 errors.
- **Feel check**: Click the Wishlist heart button on a product page; confirm a subtle, physical spring pop occurs when the item is favorited.
- **Done when**: Toggling wishlist status produces a responsive spring feedback animation on the heart icon.
